import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class EventResourceService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async createResource(data: {
    eventId: number;
    title: string;
    type: string;
    url: string;
  }) {
    return this.prisma.eventResource.create({
      data: {
        title: data.title,
        type: data.type,
        url: data.url,
        event: { connect: { id: data.eventId } },
      },
    });
  }

  async getEventResources(eventId: number) {
    return this.prisma.eventResource.findMany({
      where: { eventId },
    });
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

  async updateResource(id: number, data: {
    title?: string;
    type?: string;
    url?: string;
  }) {
    const resource = await this.prisma.eventResource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (data.url && resource.url !== data.url) {
      await this.fileUploadService.deleteFile(resource.url);
    }

    return this.prisma.eventResource.update({
      where: { id },
      data,
    });
  }

  async deleteResource(id: number) {
    const resource = await this.prisma.eventResource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    await this.fileUploadService.deleteFile(resource.url);

    await this.prisma.eventResource.delete({
      where: { id },
    });

    return { message: 'Resource deleted successfully' };
  }

  async getResourceStats(eventId: number) {
    const resources = await this.prisma.eventResource.findMany({
      where: { eventId },
    });

    const stats = {
      total: resources.length,
      byType: {},
    };

    resources.forEach((resource) => {
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;
    });

    return stats;
  }
} 