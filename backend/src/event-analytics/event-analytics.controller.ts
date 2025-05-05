import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EventAnalyticsService } from './event-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('event-analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventAnalyticsController {
  constructor(private readonly eventAnalyticsService: EventAnalyticsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async createAnalytics(
    @Body()
    data: {
      eventId: number;
      pageViews?: number;
      uniqueVisitors?: number;
      registrationCount?: number;
      checkInCount?: number;
      feedbackCount?: number;
      averageRating?: number;
    },
  ) {
    return this.eventAnalyticsService.createAnalytics(data);
  }

  @Get(':id')
  async getAnalytics(@Param('id') id: string) {
    return this.eventAnalyticsService.getAnalytics(+id);
  }

  @Get('event/:eventId')
  async getEventAnalytics(@Param('eventId') eventId: string) {
    return this.eventAnalyticsService.getEventAnalytics(+eventId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async updateAnalytics(
    @Param('id') id: string,
    @Body()
    data: {
      pageViews?: number;
      uniqueVisitors?: number;
      registrationCount?: number;
      checkInCount?: number;
      feedbackCount?: number;
      averageRating?: number;
    },
  ) {
    return this.eventAnalyticsService.updateAnalytics(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteAnalytics(@Param('id') id: string) {
    return this.eventAnalyticsService.deleteAnalytics(+id);
  }

  @Get('event/:eventId/stats')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async getEventStats(@Param('eventId') eventId: string) {
    return this.eventAnalyticsService.getEventStats(+eventId);
  }
} 