import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EventResourceService } from './event-resource.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles';

@Controller('event-resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventResourceController {
  constructor(private eventResourceService: EventResourceService) {}

  @Post()
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async createResource(
    @Body() data: {
      eventId: number;
      title: string;
      type: string;
      url: string;
    },
  ) {
    return this.eventResourceService.createResource(data);
  }

  @Get('event/:eventId')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getEventResources(@Param('eventId') eventId: string) {
    return this.eventResourceService.getEventResources(+eventId);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getResource(@Param('id') id: string) {
    return this.eventResourceService.getResource(+id);
  }

  @Put(':id')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async updateResource(
    @Param('id') id: string,
    @Body() data: {
      title?: string;
      type?: string;
      url?: string;
    },
  ) {
    return this.eventResourceService.updateResource(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async deleteResource(@Param('id') id: string) {
    return this.eventResourceService.deleteResource(+id);
  }

  @Get('stats/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getResourceStats(@Param('eventId') eventId: string) {
    return this.eventResourceService.getResourceStats(+eventId);
  }
} 