import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async createEventAnalytics(eventId: number) {
    return this.prisma.eventAnalytics.create({
      data: {
        event: { connect: { id: eventId } },
        views: 0,
        registrations: 0,
        checkIns: 0,
      },
    });
  }

  async getEventAnalytics(eventId: number) {
    const analytics = await this.prisma.eventAnalytics.findUnique({
      where: { eventId },
    });

    if (!analytics) {
      throw new NotFoundException('Analytics not found for this event');
    }

    return analytics;
  }

  async updateEventAnalytics(eventId: number, data: {
    views?: number;
    registrations?: number;
    checkIns?: number;
  }) {
    const analytics = await this.prisma.eventAnalytics.findUnique({
      where: { eventId },
    });

    if (!analytics) {
      throw new NotFoundException('Analytics not found for this event');
    }

    return this.prisma.eventAnalytics.update({
      where: { eventId },
      data: {
        views: data.views !== undefined ? data.views : undefined,
        registrations: data.registrations !== undefined ? data.registrations : undefined,
        checkIns: data.checkIns !== undefined ? data.checkIns : undefined,
      },
    });
  }

  async incrementEventViews(eventId: number) {
    const analytics = await this.prisma.eventAnalytics.findUnique({
      where: { eventId },
    });

    if (!analytics) {
      return this.createEventAnalytics(eventId);
    }

    return this.prisma.eventAnalytics.update({
      where: { eventId },
      data: {
        views: { increment: 1 },
      },
    });
  }

  async getEventStats(eventId: number) {
    const analytics = await this.prisma.eventAnalytics.findUnique({
      where: { eventId },
    });

    if (!analytics) {
      throw new NotFoundException('Analytics not found for this event');
    }

    const registrations = await this.prisma.registration.count({
      where: { eventId },
    });

    const checkedInCount = await this.prisma.registration.count({
      where: {
        eventId,
        checkedIn: true,
      },
    });

    return {
      ...analytics,
      totalRegistrations: registrations,
      checkInRate: registrations > 0 ? (checkedInCount / registrations) * 100 : 0,
    };
  }
} 