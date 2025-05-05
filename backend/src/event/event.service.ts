import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async createEvent(data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    capacity: number;
    imageUrl?: string;
    organizerId: number;
  }) {
    try {
      return await this.prisma.event.create({
        data,
        include: {
          organizer: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create event: ' + error.message);
    }
  }

  async getEvents(filters?: {
    organizerId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.event.findMany({
      where: filters,
      include: {
        organizer: true,
        resources: true,
        speakers: true,
      },
    });
  }

  async getEventById(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        resources: true,
        speakers: true,
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
    startDate?: Date;
    endDate?: Date;
    location?: string;
    capacity?: number;
    imageUrl?: string;
  }) {
    try {
      return await this.prisma.event.update({
        where: { id },
        data,
        include: {
          organizer: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Event not found');
      }
      throw new BadRequestException('Failed to update event: ' + error.message);
    }
  }

  async deleteEvent(id: number) {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // Delete event image if exists
      if (event.imageUrl) {
        await this.fileUploadService.deleteFile(event.imageUrl);
      }

      // Delete the event from database
      await this.prisma.event.delete({
        where: { id },
      });

      return { message: 'Event deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete event: ' + error.message);
    }
  }
} 