import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { Prisma } from '@prisma/client';

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
type EventCategory = 'CS' | 'RAS' | 'IAS' | 'WIE';
type EventType = 'CONGRESS' | 'CONFERENCE' | 'HACKATHON' | 'NORMAL' | 'ONLINE';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async create(data: any) {
    return this.prisma.event.create({ data });
  }

  async findAll() {
    return this.prisma.event.findMany();
  }

  async findOne(id: number) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.event.delete({ where: { id } });
  }

  async createEvent(data: {
    title: string;
    description: string;
    date: Date;
    location: string;
    image?: string;
    category: EventCategory;
    type: EventType;
    eventTag: string;
    organizerId: number;
  }) {
    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        image: data.image,
        category: data.category,
        type: data.type,
        eventTag: data.eventTag,
        status: 'DRAFT' as EventStatus,
        capacity: 0,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8),
        organizers: {
          create: {
            organizerId: data.organizerId,
            isHost: true,
          },
        },
      },
      include: {
        organizers: {
          include: {
            organizer: true,
          },
        },
      },
    });
  }

  async getEvents(filters: {
    organizerId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.event.findMany({
      where: {
        ...(filters.organizerId && {
          organizers: {
            some: {
              organizerId: filters.organizerId,
            },
          },
        }),
        ...(filters.startDate && {
          date: {
            gte: filters.startDate,
          },
        }),
        ...(filters.endDate && {
          date: {
            lte: filters.endDate,
          },
        }),
      },
      include: {
        organizers: {
          include: {
            organizer: true,
          },
        },
        eventResources: true,
        speakers: {
          include: {
            speaker: true,
          },
        },
      },
    });
  }

  async getEventById(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizers: {
          include: {
            organizer: true,
          },
        },
        eventResources: true,
        speakers: {
          include: {
            speaker: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async updateEvent(id: number, data: {
    title?: string;
    description?: string;
    date?: Date;
    status?: EventStatus;
    location?: string;
    image?: string;
    category?: EventCategory;
    type?: EventType;
    eventTag?: string;
  }) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizers: {
          include: {
            organizer: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.image && data.image && event.image !== data.image) {
      await this.fileUploadService.deleteFile(event.image);
    }

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        organizers: {
          include: {
            organizer: true,
          },
        },
      },
    });
  }

  async deleteEvent(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.image) {
      await this.fileUploadService.deleteFile(event.image);
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }
} 