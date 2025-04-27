import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { EventStatus, EventCategory, EventType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(email: string, password: string, name: string, role: Role) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    if (!email || !password || !name || !role) {
      throw new BadRequestException('Email, password, name, and role are required');
    }
    if (!Object.values(Role).includes(role)) {
      throw new BadRequestException(`Invalid role value: ${role}. Must be one of ${Object.values(Role).join(', ')}`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashedPassword, name, role },
      select: { id: true, email: true, name: true, role: true, isEmailVerified: true, createdAt: true, updatedAt: true },
    });
  }

  async updateUser(id: number, data: { email?: string; name?: string; role?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already in use by another user');
      }
    }
    if (data.role) {
      const validRoles = Object.values(Role);
      if (!validRoles.includes(data.role as Role)) {
        throw new BadRequestException(`Invalid role value: ${data.role}. Must be one of ${validRoles.join(', ')}`);
      }
    }
    return this.prisma.user.update({
      where: { id },
      data: { email: data.email, name: data.name, role: data.role as Role },
      select: { id: true, email: true, name: true, role: true, isEmailVerified: true, createdAt: true, updatedAt: true },
    });
  }

  async deleteUser(id: number) {
    return this.userService.deleteUser(id);
  }

  async getAllEvents() {
    const currentDate = new Date();
    const events = await this.prisma.event.findMany({
      include: { organizers: { include: { organizer: { select: { id: true, name: true } } } } },
      orderBy: { date: 'asc' },
    });

    for (const event of events) {
      const eventDate = new Date(event.date);
      if (eventDate < currentDate && event.status !== EventStatus.DRAFT) {
        await this.prisma.event.update({
          where: { id: event.id },
          data: { status: EventStatus.DRAFT },
        });
        event.status = EventStatus.DRAFT;
      }
    }

    return events;
  }

  async createEvent(data: {
    title: string;
    description: string;
    date: string;
    status?: EventStatus;
    organizerId: number;
    collaboratorIds?: number[];
    location?: string;
    image?: string;
    category: EventCategory;
    type: EventType;
  }) {
    const eventDate = new Date(data.date);
    if (isNaN(eventDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const host = await this.prisma.user.findUnique({ where: { id: data.organizerId } });
    if (!host || host.role !== 'ORGANIZER') {
      throw new BadRequestException('Invalid host organizer ID');
    }

    // Validate image path if provided
    if (data.image && !data.image.startsWith('/uploads/')) {
      throw new BadRequestException('Invalid image URL. Must start with /uploads/');
    }

    const collaboratorData = [];
    if (data.collaboratorIds && data.collaboratorIds.length > 0) {
      if (data.collaboratorIds.length > 2) {
        throw new BadRequestException('Maximum 2 collaborators allowed');
      }
      if (data.collaboratorIds.includes(data.organizerId)) {
        throw new BadRequestException('Host cannot be a collaborator');
      }
      const collaborators = await this.prisma.user.findMany({
        where: { id: { in: data.collaboratorIds }, role: 'ORGANIZER' },
      });
      if (collaborators.length !== data.collaboratorIds.length) {
        const invalidIds = data.collaboratorIds.filter(id => !collaborators.some(c => c.id === id));
        throw new BadRequestException(`Invalid collaborator IDs: ${invalidIds.join(', ')}`);
      }
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);
      for (const id of data.collaboratorIds) {
        collaboratorData.push({
          organizer: { connect: { id } },
          isHost: false,
          pendingConfirmation: true,
          expiresAt,
        });

        const collaborator = collaborators.find(c => c.id === id);
        await this.emailService.sendMail({
          to: collaborator.email,
          subject: `Confirm Participation: ${data.title}`,
          text: `You’ve been selected as a collaborator for "${data.title}" on ${data.date}. Please confirm within 3 days: http://your-app.com/admin/events/confirm`,
        });
      }
    }

    const eventTag = `${data.category}-${data.type}`;
    const event = await this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: eventDate,
        status: EventStatus.DRAFT,
        location: data.location,
        image: data.image,
        category: data.category,
        type: data.type,
        eventTag,
        organizers: {
          create: [
            { organizer: { connect: { id: data.organizerId } }, isHost: true, pendingConfirmation: false },
            ...collaboratorData,
          ],
        },
      },
      include: { organizers: { include: { organizer: { select: { id: true, name: true } } } } },
    });

    return event;
  }

  async confirmEventParticipation(eventId: number, organizerId: number, confirm: boolean) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: { include: { organizer: true } } },
    });
    if (!event || event.status !== 'DRAFT') {
      throw new NotFoundException('Event not found or not in DRAFT status');
    }

    const organizerEntry = event.organizers.find(o => o.organizerId === organizerId);
    if (!organizerEntry || !organizerEntry.pendingConfirmation) {
      throw new BadRequestException('Organizer not pending confirmation for this event');
    }

    if (!confirm) {
      // Delete the image file if it exists and is not used by other events
      if (event.image) {
        const otherEvents = await this.prisma.event.findMany({
          where: { image: event.image, id: { not: eventId } },
        });
        if (otherEvents.length === 0) {
          const filePath = path.join(process.cwd(), event.image);
          try {
            await fs.unlink(filePath);
            console.log(`ℹ️ [AdminService] Deleted image file: ${filePath}`);
          } catch (err) {
            console.error(`🚨 [AdminService] Error deleting image file: ${filePath}`, err.message);
          }
        }
      }
      await this.prisma.event.delete({ where: { id: eventId } });
      const host = event.organizers.find(o => o.isHost).organizer;
      await this.emailService.sendMail({
        to: host.email,
        subject: `Event "${event.title}" Declined`,
        text: `The event "${event.title}" was deleted because a collaborator declined.`,
      });
      return { message: 'Event declined and deleted' };
    }

    await this.prisma.eventOrganizer.update({
      where: { eventId_organizerId: { eventId, organizerId } },
      data: { pendingConfirmation: false, expiresAt: null },
    });

    const updatedEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: true },
    });
    const allConfirmed = updatedEvent.organizers.every(o => !o.pendingConfirmation);

    if (allConfirmed) {
      await this.prisma.event.update({
        where: { id: eventId },
        data: { status: EventStatus.PUBLISHED },
      });
      const hostId = updatedEvent.organizers.find(o => o.isHost).organizerId;
      const host = await this.prisma.user.findUnique({ where: { id: hostId } });
      await this.emailService.sendMail({
        to: host.email,
        subject: `Event "${event.title}" Published`,
        text: `The event "${event.title}" is now PUBLISHED with all organizers confirmed.`,
      });
    }

    return { message: confirm ? 'Participation confirmed' : 'Participation declined' };
  }

  async updateEvent(
    id: number,
    data: {
      title?: string;
      description?: string;
      date?: string;
      status?: EventStatus;
      organizerId?: number;
      location?: string;
      image?: string;
      category?: EventCategory;
      type?: EventType;
    },
  ) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.status === 'DRAFT') {
      throw new BadRequestException('Cannot update DRAFT event until all organizers confirm');
    }

    // Validate image path if provided
    if (data.image && !data.image.startsWith('/uploads/')) {
      throw new BadRequestException('Invalid image URL. Must start with /uploads/');
    }

    // If a new image is provided, delete the old one if not used by other events
    if (data.image && event.image && data.image !== event.image) {
      const otherEvents = await this.prisma.event.findMany({
        where: { image: event.image, id: { not: id } },
      });
      if (otherEvents.length === 0) {
        const filePath = path.join(process.cwd(), event.image);
        try {
          await fs.unlink(filePath);
          console.log(`ℹ️ [AdminService] Deleted old image file: ${filePath}`);
        } catch (err) {
          console.error(`🚨 [AdminService] Error deleting old image file: ${filePath}`, err.message);
        }
      }
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
      status: data.status,
      location: data.location,
      image: data.image,
      category: data.category,
      type: data.type,
      eventTag: data.category && data.type ? `${data.category}-${data.type}` : undefined,
    };

    if (data.organizerId) {
      const organizer = await this.prisma.user.findUnique({ where: { id: data.organizerId } });
      if (!organizer || organizer.role !== 'ORGANIZER') {
        throw new BadRequestException('Invalid organizer ID');
      }
      updateData.organizers = {
        deleteMany: { eventId: id, isHost: false },
        create: [{ organizer: { connect: { id: data.organizerId } }, isHost: false }],
      };
    }

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: { organizers: { include: { organizer: { select: { id: true, name: true } } } } },
    });
  }

  async deleteEvent(id: number) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    // Delete the image file if it exists and is not used by other events
    if (event.image) {
      const otherEvents = await this.prisma.event.findMany({
        where: { image: event.image, id: { not: id } },
      });
      if (otherEvents.length === 0) {
        const filePath = path.join(process.cwd(), event.image);
        try {
          await fs.unlink(filePath);
          console.log(`ℹ️ [AdminService] Deleted image file: ${filePath}`);
        } catch (err) {
          console.error(`🚨 [AdminService] Error deleting image file: ${filePath}`, err.message);
        }
      }
    }
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted successfully' };
  }
}