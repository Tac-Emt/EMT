import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  InternalServerErrorException,
  HttpCode,
  Request,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventService } from './organizer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerGuard } from '../auth/guards/organizer.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED'
}

enum EventCategory {
  CS = 'CS',
  RAS = 'RAS',
  IAS = 'IAS',
  WIE = 'WIE'
}

enum EventType {
  CONGRESS = 'CONGRESS',
  CONFERENCE = 'CONFERENCE',
  HACKATHON = 'HACKATHON',
  NORMAL = 'NORMAL',
  ONLINE = 'ONLINE'
}

@Controller('organizer/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post('events')
  @Roles('ORGANIZER')
  async createEvent(
    @Body() data: {
      title: string;
      description?: string;
      date: string;
      location?: string;
      image?: string;
      category: EventCategory;
      type: EventType;
      eventTag: string;
      registrationLink?: string;
      pageContent?: any;
      pageSettings?: any;
      collaboratorIds?: number[];
      speakerRequests?: { speakerId: number; topic?: string; description?: string }[];
    },
    @Request() req: any,
  ) {
    try {
      console.log('ℹ️ [OrganizerController] Creating event:', { data });
      const event = await this.eventService.createEvent(req.user.id, data);
      return { message: 'Event created successfully', data: event };
    } catch (error) {
      console.error('🚨 [OrganizerController] Error creating event:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create event: ' + error.message);
    }
  }

  @Post(':id/confirm')
  async confirmEventParticipation(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { confirm: boolean },
  ) {
    try {
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        throw new BadRequestException('Event ID must be a valid integer');
      }
      if (typeof body.confirm !== 'boolean') {
        throw new BadRequestException('Confirm must be a boolean');
      }

      const result = await this.eventService.confirmEventParticipation(eventId, req.user.id, body.confirm);
      return {
        message: result.message,
        event: null,
      };
    } catch (error) {
      console.error('🚨 [EventController] Error confirming participation:', error.message);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to confirm participation: ' + error.message);
    }
  }

  @Get()
  async getEvents(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const organizerId = req.user.id;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestException('Page must be a positive integer');
      }
      if (isNaN(limitNum) || limitNum < 1) {
        throw new BadRequestException('Limit must be a positive integer');
      }

      console.log('ℹ️ [EventController] Fetching events for organizer:', organizerId);
      return await this.eventService.getOrganizerEvents(organizerId, pageNum, limitNum);
    } catch (error) {
      console.error('🚨 [EventController] Error fetching events:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch events: ' + error.message);
    }
  }

  @Get(':id')
  async getEventById(@Request() req: any, @Param('id') id: string) {
    try {
      const organizerId = req.user.id;
      const eventId = parseInt(id);

      if (isNaN(eventId)) {
        throw new BadRequestException('Event ID must be a valid integer');
      }

      const event = await this.eventService.getEventById(eventId);
      return {
        message: 'Event fetched successfully',
        event,
      };
    } catch (error) {
      console.error('🚨 [EventController] Error fetching event by ID:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch event: ' + error.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  async updateEvent(
    @Param('id') id: string,
    @Body() body: {
      title?: string;
      description?: string;
      date?: string;
      status?: EventStatus;
      location?: string;
      image?: string;
      category?: EventCategory;
      type?: EventType;
      collaboratorIds?: number[];
      registrationLink?: string;
      pageContent?: any;
      pageSettings?: any;
    },
    @Request() req: any,
  ) {
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      throw new BadRequestException('Invalid event ID');
    }

    return this.eventService.updateEvent(eventId, req.user.id, body);
  }

  @Delete(':id')
  async deleteEvent(@Request() req: any, @Param('id') id: string) {
    try {
      const organizerId = req.user.id;
      const eventId = parseInt(id);

      if (isNaN(eventId)) {
        throw new BadRequestException('Event ID must be a valid integer');
      }

      const result = await this.eventService.deleteEvent(eventId, organizerId);
      return {
        message: 'Event deleted successfully',
        details: result,
      };
    } catch (error) {
      console.error('🚨 [EventController] Error deleting event:', error.message);
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete event: ' + error.message);
    }
  }

  private validateEventStatus(status: string): EventStatus {
    const validStatuses = Object.values(EventStatus);
    if (!validStatuses.includes(status as EventStatus)) {
      throw new BadRequestException(`Invalid status value: ${status}. Must be one of ${validStatuses.join(', ')}`);
    }
    return status as EventStatus;
  }
}