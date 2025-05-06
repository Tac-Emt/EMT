import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EventAnalyticsService } from './event-analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles';

@Controller('event-analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventAnalyticsController {
  constructor(private eventAnalyticsService: EventAnalyticsService) {}

  @Post('event/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async createEventAnalytics(@Param('eventId') eventId: string) {
    return this.eventAnalyticsService.createEventAnalytics(+eventId);
  }

  @Get('event/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getEventAnalytics(@Param('eventId') eventId: string) {
    return this.eventAnalyticsService.getEventAnalytics(+eventId);
  }

  @Post('event/:eventId/update')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async updateEventAnalytics(
    @Param('eventId') eventId: string,
    @Body() data: {
      views?: number;
      registrations?: number;
      checkIns?: number;
    },
  ) {
    return this.eventAnalyticsService.updateEventAnalytics(+eventId, data);
  }

  @Post('event/:eventId/increment-views')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async incrementEventViews(@Param('eventId') eventId: string) {
    return this.eventAnalyticsService.incrementEventViews(+eventId);
  }

  @Get('event/:eventId/stats')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getEventStats(@Param('eventId') eventId: string) {
    return this.eventAnalyticsService.getEventStats(+eventId);
  }
} 