import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventResourceService {
  constructor(private prisma: PrismaService) {}

  async createResource(data: {
    eventId: number;
    name: string;
    type: string;
    url: string;
    description?: string;
    isPublic?: boolean;
  }) {
    try {
      return await this.prisma.eventResource.create({
        data,
        include: {
          event: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create resource: ' + error.message);
    }
  }

  async getResource(id: number) {
    const resource = await this.prisma.eventResource.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async getEventResources(eventId: number, isPublic?: boolean) {
    return this.prisma.eventResource.findMany({
      where: {
        eventId,
        ...(isPublic !== undefined ? { isPublic } : {}),
      },
      include: {
        event: true,
      },
    });
  }

  async updateResource(
    id: number,
    data: {
      name?: string;
      type?: string;
      url?: string;
      description?: string;
      isPublic?: boolean;
    },
  ) {
    try {
      return await this.prisma.eventResource.update({
        where: { id },
        data,
        include: {
          event: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Resource not found');
      }
      throw new BadRequestException('Failed to update resource: ' + error.message);
    }
  }

  async deleteResource(id: number) {
    try {
      await this.prisma.eventResource.delete({
        where: { id },
      });
      return { message: 'Resource deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Resource not found');
      }
      throw new BadRequestException('Failed to delete resource: ' + error.message);
    }
  }

  async getResourceStats(eventId: number) {
    const resources = await this.prisma.eventResource.findMany({
      where: { eventId },
    });

    const stats = {
      total: resources.length,
      byType: {},
      publicCount: 0,
      privateCount: 0,
    };

    resources.forEach((resource) => {
      // Count by type
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;

      // Count public/private
      if (resource.isPublic) {
        stats.publicCount++;
      } else {
        stats.privateCount++;
      }
    });

    return stats;
  }
} 