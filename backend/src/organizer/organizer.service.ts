import { Injectable, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { EventStatus, EventCategory, EventType } from '.prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createEvent(
    organizerId: number,
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
      collaboratorIds?: number[];
      speakerRequests?: { speakerId: number; topic?: string; description?: string }[];
    },
  ) {
    try {
      console.log('ℹ️ [OrganizerService] Creating event:', { organizerId, data });

      // Validate date format
      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      // Validate registration link if provided
      if (data.registrationLink && !data.registrationLink.startsWith('http')) {
        throw new BadRequestException('Registration link must start with http');
      }

      // Generate slug from title
      const slug = this.generateSlug(data.title);

      // Create event with host organizer
      const event = await this.prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          date: eventDate,
          location: data.location,
          image: data.image,
          category: data.category,
          type: data.type,
          eventTag: data.eventTag,
          registrationLink: data.registrationLink,
          slug,
          pageContent: data.pageContent,
          pageSettings: data.pageSettings,
          organizers: {
            create: {
              organizerId,
              isHost: true,
            },
          },
          speakers: data.speakerRequests ? {
            create: data.speakerRequests.map(request => ({
              speakerId: request.speakerId,
              topic: request.topic,
              description: request.description,
              status: 'PENDING',
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

      return event;
    } catch (error) {
      console.error('🚨 [OrganizerService] Error creating event:', error.message);
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
    eventId: number,
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
      collaboratorIds?: number[];
      registrationLink?: string;
      pageContent?: any;
      pageSettings?: any;
    },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: {
          include: { organizer: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isHost = event.organizers.some(
      (o) => o.organizerId === organizerId && o.isHost,
    );
    if (!isHost) {
      throw new ForbiddenException('Only the host can update the event');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled event');
    }

    if (data.date) {
      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    }

    if (data.registrationLink && !data.registrationLink.startsWith('http')) {
      throw new BadRequestException('Invalid registration link. Must be a valid URL starting with http');
    }

    if (data.image && !data.image.startsWith('/uploads/')) {
      throw new BadRequestException('Invalid image URL. Must start with /uploads/');
    }

    if (data.pageContent && typeof data.pageContent !== 'object') {
      throw new BadRequestException('Page content must be a valid JSON object');
    }

    if (data.pageSettings && typeof data.pageSettings !== 'object') {
      throw new BadRequestException('Page settings must be a valid JSON object');
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    if (data.category && data.type) {
      updateData.eventTag = `${data.category}-${data.type}`;
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        organizers: {
          include: { organizer: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return updatedEvent;
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