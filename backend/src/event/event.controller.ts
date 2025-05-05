import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async createEvent(@Body() data: any) {
    return this.eventService.createEvent(data);
  }

  @Get()
  async getEvents(@Query() filters: any) {
    return this.eventService.getEvents(filters);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(+id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async updateEvent(@Param('id') id: string, @Body() data: any) {
    return this.eventService.updateEvent(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async deleteEvent(@Param('id') id: string) {
    return this.eventService.deleteEvent(+id);
  }
} 