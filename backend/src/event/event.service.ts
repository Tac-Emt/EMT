import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { EventStatus, EventCategory, EventType } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createEvent(
    title: string,
    description: string,
    date: string,
    organizerId: number,
    category: EventCategory,
    type: EventType,
    status: EventStatus = EventStatus.DRAFT,
    location?: string,
    image?: string,
    collaboratorIds?: number[],
  ) {
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const organizer = await this.prisma.user.findUnique({
      where: { id: organizerId },
    });
    if (!organizer || organizer.role !== 'ORGANIZER') {
      throw new BadRequestException('User must have ORGANIZER role');
    }

    // Validate image path if provided
    if (image && !image.startsWith('/uploads/')) {
      throw new BadRequestException('Invalid image URL. Must start with /uploads/');
    }

    const collaboratorData = [];
    if (collaboratorIds && collaboratorIds.length > 0) {
      if (collaboratorIds.length > 2) {
        throw new BadRequestException('Maximum 2 collaborators allowed');
      }
      if (collaboratorIds.includes(organizerId)) {
        throw new BadRequestException('Host cannot be a collaborator');
      }
      const collaborators = await this.prisma.user.findMany({
        where: { id: { in: collaboratorIds }, role: 'ORGANIZER' },
      });
      if (collaborators.length !== collaboratorIds.length) {
        const invalidIds = collaboratorIds.filter(id => !collaborators.some(c => c.id === id));
        throw new BadRequestException(`Invalid collaborator IDs: ${invalidIds.join(', ')}`);
      }
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      for (const id of collaboratorIds) {
        collaboratorData.push({
          organizer: { connect: { id } },
          isHost: false,
          pendingConfirmation: true,
          expiresAt,
        });
      }
    }

    const eventTag = `${category}-${type}`;

    const event = await this.prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        status,
        location,
        image,
        category,
        type,
        eventTag,
        organizers: {
          create: [
            {
              organizer: { connect: { id: organizerId } },
              isHost: true,
              pendingConfirmation: false,
            },
            ...collaboratorData,
          ],
        },
      },
      include: {
        organizers: {
          include: { organizer: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (collaboratorIds) {
      for (const collaborator of event.organizers.filter(o => !o.isHost)) {
        await this.emailService.sendCollaborationConfirmation(
          collaborator.organizer.email,
          event.title,
          event.date.toISOString(),
          event.id,
          collaborator.organizerId,
        );
      }
    }

    return event;
  }

  async confirmEventParticipation(eventId: number, organizerId: number, confirm: boolean) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: { include: { organizer: { select: { id: true, email: true, name: true } } } } },
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
            console.log(`ℹ️ [EventService] Deleted image file: ${filePath}`);
          } catch (err) {
            console.error(`🚨 [EventService] Error deleting image file: ${filePath}`, err.message);
          }
        }
      }
      await this.prisma.event.delete({ where: { id: eventId } });
      const host = event.organizers.find(o => o.isHost).organizer;
      await this.emailService.sendHostNotification(
        host.email,
        event.title,
        `The event "${event.title}" was deleted because a collaborator declined.`,
      );
      return { message: 'Event declined and deleted' };
    }

    await this.prisma.eventOrganizer.update({
      where: { eventId_organizerId: { eventId, organizerId } },
      data: { pendingConfirmation: false, expiresAt: null },
    });

    const updatedEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: {
          include: { organizer: { select: { id: true, email: true, name: true } } },
        },
      },
    });
    const allConfirmed = updatedEvent.organizers.every(o => !o.pendingConfirmation);

    if (allConfirmed) {
      await this.prisma.event.update({
        where: { id: eventId },
        data: { status: EventStatus.PUBLISHED },
      });
      const host = updatedEvent.organizers.find(o => o.isHost).organizer;
      await this.emailService.sendHostNotification(
        host.email,
        event.title,
        `The event "${event.title}" is now PUBLISHED with all organizers confirmed.`,
      );
    }

    return { message: 'Participation confirmed' };
  }

  async getOrganizerEvents(organizerId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: {
          organizers: { some: { organizerId } },
        },
        include: {
          organizers: {
            include: { organizer: { select: { id: true, name: true } } },
          },
        },
        orderBy: { date: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.event.count({
        where: {
          organizers: { some: { organizerId } },
        },
      }),
    ]);

    const statusBreakdown = await this.prisma.event.groupBy({
      by: ['status'],
      where: { organizers: { some: { organizerId } } },
      _count: { status: true },
    });

    const categoryBreakdown = await this.prisma.event.groupBy({
      by: ['category'],
      where: { organizers: { some: { organizerId } } },
      _count: { category: true },
    });

    const typeBreakdown = await this.prisma.event.groupBy({
      by: ['type'],
      where: { organizers: { some: { organizerId } } },
      _count: { type: true },
    });

    const upcomingEvents = await this.prisma.event.count({
      where: {
        organizers: { some: { organizerId } },
        status: EventStatus.PUBLISHED,
        date: { gt: new Date() },
      },
    });

    return {
      events,
      total,
      statusBreakdown: statusBreakdown.map(item => [item.status, item._count.status]),
      categoryBreakdown: categoryBreakdown.map(item => [item.category, item._count.category]),
      typeBreakdown: typeBreakdown.map(item => [item.type, item._count.type]),
      upcomingEvents,
    };
  }

  async getEventById(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizers: {
          include: { organizer: { select: { id: true, name: true } } },
        },
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async updateEvent(
    id: number,
    organizerId: number,
    data: {
      title?: string;
      description?: string;
      date?: string;
      status?: EventStatus;
      location?: string;
      image?: string;
      category?: EventCategory;
      type?: EventType;
    },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { organizers: { select: { organizerId: true, isHost: true } } },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (!event.organizers.some(o => o.organizerId === organizerId && o.isHost)) {
      throw new ForbiddenException('Only the host organizer can update this event');
    }
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT events can be updated');
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
          console.log(`ℹ️ [EventService] Deleted old image file: ${filePath}`);
        } catch (err) {
          console.error(`🚨 [EventService] Error deleting old image file: ${filePath}`, err.message);
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

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizers: {
          include: { organizer: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async deleteEvent(id: number, organizerId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { organizers: { select: { organizerId: true, isHost: true } } },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (!event.organizers.some(o => o.organizerId === organizerId && o.isHost)) {
      throw new ForbiddenException('Only the host organizer can delete this event');
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
          console.log(`ℹ️ [EventService] Deleted image file: ${filePath}`);
        } catch (err) {
          console.error(`🚨 [EventService] Error deleting image file: ${filePath}`, err.message);
        }
      }
    }

    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted successfully' };
  }
}