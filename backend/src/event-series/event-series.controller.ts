import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EventSeriesService } from './event-series.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@Controller('event-series')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventSeriesController {
  constructor(private readonly eventSeriesService: EventSeriesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async createSeries(@Body() data: { name: string; description?: string }) {
    return this.eventSeriesService.createSeries(data);
  }

  @Get()
  async getAllSeries() {
    return this.eventSeriesService.getAllSeries();
  }

  @Get(':id')
  async getSeries(@Param('id') id: string) {
    return this.eventSeriesService.getSeries(+id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async updateSeries(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string },
  ) {
    return this.eventSeriesService.updateSeries(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteSeries(@Param('id') id: string) {
    return this.eventSeriesService.deleteSeries(+id);
  }

  @Post(':seriesId/events/:eventId')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async addEventToSeries(
    @Param('seriesId') seriesId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.eventSeriesService.addEventToSeries(+seriesId, +eventId);
  }

  @Delete(':seriesId/events/:eventId')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async removeEventFromSeries(
    @Param('seriesId') seriesId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.eventSeriesService.removeEventFromSeries(+seriesId, +eventId);
  }
} 