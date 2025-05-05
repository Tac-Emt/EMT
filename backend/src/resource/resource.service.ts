import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class ResourceService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async createResource(data: {
    title: string;
    description?: string;
    fileUrl: string;
    type: string;
    category: string;
    isPublic: boolean;
    eventId: number;
    speakerId?: number;
  }) {
    try {
      return await this.prisma.resource.create({
        data,
        include: {
          event: true,
          speaker: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create resource: ' + error.message);
    }
  }

  async getResources(filters?: {
    eventId?: number;
    speakerId?: number;
    type?: string;
    category?: string;
  }) {
    return this.prisma.resource.findMany({
      where: filters,
      include: {
        event: true,
        speaker: true,
      },
    });
  }

  async getResourceById(id: number) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        event: true,
        speaker: true,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async updateResource(id: number, data: {
    title?: string;
    description?: string;
    fileUrl?: string;
    type?: string;
    category?: string;
    isPublic?: boolean;
    speakerId?: number;
  }) {
    try {
      return await this.prisma.resource.update({
        where: { id },
        data,
        include: {
          event: true,
          speaker: true,
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
      const resource = await this.prisma.resource.findUnique({
        where: { id },
      });

      if (!resource) {
        throw new NotFoundException('Resource not found');
      }

      // Delete the file from storage
      await this.fileUploadService.deleteFile(resource.fileUrl);

      // Delete the resource from database
      await this.prisma.resource.delete({
        where: { id },
      });

      return { message: 'Resource deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete resource: ' + error.message);
    }
  }

  async getResourceStats(eventId: number) {
    const resources = await this.prisma.resource.findMany({
      where: { eventId },
    });

    const stats = {
      total: resources.length,
      byType: {},
      byCategory: {},
      byVisibility: {
        public: 0,
        private: 0,
      },
    };

    resources.forEach((resource) => {
      // Count by type
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;

      // Count by category
      stats.byCategory[resource.category] = (stats.byCategory[resource.category] || 0) + 1;

      // Count by visibility
      stats.byVisibility[resource.isPublic ? 'public' : 'private']++;
    });

    return stats;
  }
} 