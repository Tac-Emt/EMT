import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventResourceService } from './event-resource.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('event-resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventResourceController {
  constructor(private readonly eventResourceService: EventResourceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async createResource(
    @Body()
    data: {
      eventId: number;
      name: string;
      type: string;
      url: string;
      description?: string;
      isPublic?: boolean;
    },
  ) {
    return this.eventResourceService.createResource(data);
  }

  @Get(':id')
  async getResource(@Param('id') id: string) {
    return this.eventResourceService.getResource(+id);
  }

  @Get('event/:eventId')
  async getEventResources(
    @Param('eventId') eventId: string,
    @Query('isPublic') isPublic?: string,
  ) {
    return this.eventResourceService.getEventResources(
      +eventId,
      isPublic ? isPublic === 'true' : undefined,
    );
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async updateResource(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      type?: string;
      url?: string;
      description?: string;
      isPublic?: boolean;
    },
  ) {
    return this.eventResourceService.updateResource(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async deleteResource(@Param('id') id: string) {
    return this.eventResourceService.deleteResource(+id);
  }

  @Get('event/:eventId/stats')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async getResourceStats(@Param('eventId') eventId: string) {
    return this.eventResourceService.getResourceStats(+eventId);
  }
} 