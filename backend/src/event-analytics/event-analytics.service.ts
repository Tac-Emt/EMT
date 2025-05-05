import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async createAnalytics(data: {
    eventId: number;
    pageViews?: number;
    uniqueVisitors?: number;
    registrationCount?: number;
    checkInCount?: number;
    feedbackCount?: number;
    averageRating?: number;
  }) {
    try {
      return await this.prisma.eventAnalytics.create({
        data,
        include: {
          event: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create analytics: ' + error.message);
    }
  }

  async getAnalytics(id: number) {
    const analytics = await this.prisma.eventAnalytics.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!analytics) {
      throw new NotFoundException('Analytics not found');
    }

    return analytics;
  }

  async getEventAnalytics(eventId: number) {
    return this.prisma.eventAnalytics.findMany({
      where: { eventId },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateAnalytics(
    id: number,
    data: {
      pageViews?: number;
      uniqueVisitors?: number;
      registrationCount?: number;
      checkInCount?: number;
      feedbackCount?: number;
      averageRating?: number;
    },
  ) {
    try {
      return await this.prisma.eventAnalytics.update({
        where: { id },
        data,
        include: {
          event: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Analytics not found');
      }
      throw new BadRequestException('Failed to update analytics: ' + error.message);
    }
  }

  async deleteAnalytics(id: number) {
    try {
      await this.prisma.eventAnalytics.delete({
        where: { id },
      });
      return { message: 'Analytics deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Analytics not found');
      }
      throw new BadRequestException('Failed to delete analytics: ' + error.message);
    }
  }

  async getEventStats(eventId: number) {
    const [analytics, registrations, checkIns, feedback] = await Promise.all([
      this.prisma.eventAnalytics.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
      this.prisma.registration.count({
        where: { eventId },
      }),
      this.prisma.checkIn.count({
        where: { eventId },
      }),
      this.prisma.speakerFeedback.findMany({
        where: { eventId },
      }),
    ]);

    const latestAnalytics = analytics[0] || {
      pageViews: 0,
      uniqueVisitors: 0,
      registrationCount: 0,
      checkInCount: 0,
      feedbackCount: 0,
      averageRating: 0,
    };

    const averageRating =
      feedback.length > 0
        ? feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length
        : 0;

    return {
      ...latestAnalytics,
      registrationCount: registrations,
      checkInCount: checkIns,
      feedbackCount: feedback.length,
      averageRating,
      checkInRate: registrations > 0 ? (checkIns / registrations) * 100 : 0,
    };
  }
} 