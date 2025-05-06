import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { Role } from '../auth/decorators/roles.decorator';
import { EventStatus, EventCategory, EventType, SpeakerStatus } from '@prisma/client';
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

  async updateUser(id: number, data: { email?: string; name?: string; role?: Role }) {
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
    if (data.role && !Object.values(Role).includes(data.role)) {
      throw new BadRequestException(`Invalid role value: ${data.role}. Must be one of ${Object.values(Role).join(', ')}`);
    }
    return this.prisma.user.update({
      where: { id },
      data: { email: data.email, name: data.name, role: data.role },
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

  async createEvent(
    data: {
      title: string;
      description?: string;
      date: string;
      location?: string;
      image?: string;
      category: EventCategory;
      type: EventType;
      eventTag: string;
      registrationLink?: string;
      pageContent?: any;
      pageSettings?: any;
      organizerIds: number[];
      speakerRequests?: { speakerId: number; topic?: string; description?: string }[];
    },
  ) {
    try {
      console.log('ℹ️ [AdminService] Creating event:', { data });

      // Validate date format
      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      // Validate registration link if provided
      if (data.registrationLink && !data.registrationLink.startsWith('http')) {
        throw new BadRequestException('Registration link must start with http');
      }

      // Validate organizers
      const organizers = await this.prisma.user.findMany({
        where: {
          id: { in: data.organizerIds },
          role: Role.ORGANIZER,
        },
      });

      if (organizers.length !== data.organizerIds.length) {
        throw new BadRequestException('One or more invalid organizer IDs');
      }

      // Generate slug from title
      const slug = this.generateSlug(data.title);

      // Create event with organizers
      const event = await this.prisma.event.create({
        data: {
          title: data.title,
          description: data.description || '',
          date: eventDate,
          location: data.location || '',
          capacity: 0,
          image: data.image,
          category: data.category,
          type: data.type,
          eventTag: data.eventTag,
          registrationLink: data.registrationLink,
          slug,
          pageContent: data.pageContent,
          pageSettings: data.pageSettings,
          organizers: {
            create: data.organizerIds.map((organizerId, index) => ({
              organizerId,
              isHost: index === 0,
            })),
          },
          speakers: data.speakerRequests ? {
            create: data.speakerRequests.map(request => ({
              speakerId: request.speakerId,
              topic: request.topic,
              description: request.description,
              status: SpeakerStatus.PENDING,
            })),
          } : undefined,
        },
        include: {
          organizers: {
            include: {
              organizer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          speakers: {
            include: {
              speaker: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Send email notifications to speakers
      if (data.speakerRequests) {
        for (const request of data.speakerRequests) {
          const speaker = await this.prisma.user.findUnique({
            where: { id: request.speakerId },
          });
          if (speaker) {
            await this.emailService.sendMail({
              to: speaker.email,
              subject: `Speaker Request: ${data.title}`,
              text: `You have been invited to speak at "${data.title}". Topic: ${request.topic || 'Not specified'}. Description: ${request.description || 'Not provided'}.`,
            });
          }
        }
      }

      // Send email notifications to organizers
      for (const organizer of organizers) {
        await this.emailService.sendMail({
          to: organizer.email,
          subject: `New Event Assignment: ${data.title}`,
          text: `You have been assigned as ${organizer.id === data.organizerIds[0] ? 'host' : 'organizer'} for the event "${data.title}".`,
        });
      }

      return event;
    } catch (error) {
      console.error('🚨 [AdminService] Error creating event:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create event: ' + error.message);
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);
  }

  async confirmEventParticipation(eventId: number, organizerId: number, confirm: boolean) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: { include: { organizer: true } } },
    });
    if (!event || event.status !== EventStatus.DRAFT) {
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
      registrationLink?: string;
      pageContent?: any;
      pageSettings?: any;
    },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { organizers: { select: { organizerId: true, isHost: true } } },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (data.date) {
      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      data.date = eventDate.toISOString();
    }

    // Validate registration link if provided
    if (data.registrationLink && !data.registrationLink.startsWith('http')) {
      throw new BadRequestException('Invalid registration link. Must be a valid URL starting with http');
    }

    // Validate image path if provided
    if (data.image && !data.image.startsWith('/uploads/')) {
      throw new BadRequestException('Invalid image URL. Must start with /uploads/');
    }

    // Validate page content and settings if provided
    if (data.pageContent && typeof data.pageContent !== 'object') {
      throw new BadRequestException('Page content must be a valid JSON object');
    }
    if (data.pageSettings && typeof data.pageSettings !== 'object') {
      throw new BadRequestException('Page settings must be a valid JSON object');
    }

    const updateData: any = { ...data };
    if (data.category && data.type) {
      updateData.eventTag = `${data.category}-${data.type}`;
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