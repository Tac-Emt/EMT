import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventTaskService } from './event-task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Controller('event-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventTaskController {
  constructor(private readonly eventTaskService: EventTaskService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async createTask(
    @Body()
    data: {
      eventId: number;
      title: string;
      description?: string;
      assignedTo?: number;
      dueDate?: Date;
      priority?: number;
    },
  ) {
    return this.eventTaskService.createTask(data);
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    return this.eventTaskService.getTask(+id);
  }

  @Get('event/:eventId')
  async getEventTasks(
    @Param('eventId') eventId: string,
    @Query('status') status?: TaskStatus,
  ) {
    return this.eventTaskService.getEventTasks(+eventId, status);
  }

  @Get('user/:userId')
  async getUserTasks(
    @Param('userId') userId: string,
    @Query('status') status?: TaskStatus,
  ) {
    return this.eventTaskService.getUserTasks(+userId, status);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async updateTask(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      description?: string;
      assignedTo?: number;
      dueDate?: Date;
      priority?: number;
      status?: TaskStatus;
    },
  ) {
    return this.eventTaskService.updateTask(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async deleteTask(@Param('id') id: string) {
    return this.eventTaskService.deleteTask(+id);
  }

  @Get('event/:eventId/stats')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async getTaskStats(@Param('eventId') eventId: string) {
    return this.eventTaskService.getTaskStats(+eventId);
  }
} 