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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerGuard } from '../auth/guards/organizer.guard';
import { EventStatus, EventCategory, EventType } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('organizer/events')
@UseGuards(JwtAuthGuard, OrganizerGuard)
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './Uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `image-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only JPG, JPEG, and PNG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async createEvent(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      title: string;
      description?: string;
      date: string;
      status?: string;
      location?: string;
      category: string;
      type: string;
      collaboratorIds?: string;
      existingImageUrl?: string; // New field for reusing existing images
    },
  ) {
    try {
      const organizerId = req.user.id;
      const { title, description, date, status, location, category, type, collaboratorIds, existingImageUrl } = body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new BadRequestException('Title is required and must be a non-empty string');
      }
      if (!date || isNaN(new Date(date).getTime())) {
        throw new BadRequestException('Date is required and must be a valid ISO date string');
      }
      if (!category || !Object.values(EventCategory).includes(category as EventCategory)) {
        throw new BadRequestException(`Category is required and must be one of ${Object.values(EventCategory).join(', ')}`);
      }
      if (!type || !Object.values(EventType).includes(type as EventType)) {
        throw new BadRequestException(`Type is required and must be one of ${Object.values(EventType).join(', ')}`);
      }

      let parsedCollaboratorIds: number[] | undefined;
      if (collaboratorIds) {
        parsedCollaboratorIds = collaboratorIds.split(',').map(id => {
          const num = parseInt(id.trim());
          if (isNaN(num) || num <= 0) {
            throw new BadRequestException('Collaborator IDs must be positive integers');
          }
          return num;
        });
        if (parsedCollaboratorIds.includes(organizerId)) {
          throw new BadRequestException('Host cannot be included in collaboratorIds');
        }
      }

      const validatedStatus = status ? this.validateEventStatus(status) : undefined;
      const validatedCategory = category as EventCategory;
      const validatedType = type as EventType;
      // Use existingImageUrl if provided, else use uploaded file path
      const imagePath = existingImageUrl || (file ? `/uploads/${file.filename}` : undefined);

      const newEvent = await this.eventService.createEvent(
        title,
        description || '',
        date,
        organizerId,
        validatedCategory,
        validatedType,
        validatedStatus,
        location,
        imagePath,
        parsedCollaboratorIds,
      );

      return {
        message: 'Event created successfully',
        event: newEvent,
      };
    } catch (error) {
      console.error('🚨 [EventController] Error creating event:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
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

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './Uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `image-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only JPG, JPEG, and PNG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async updateEvent(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      title?: string;
      description?: string;
      date?: string;
      status?: string;
      location?: string;
      category?: string;
      type?: string;
      existingImageUrl?: string; // New field for reusing existing images
    },
  ) {
    try {
      const organizerId = req.user.id;
      const eventId = parseInt(id);
      const { title, description, date, status, location, category, type, existingImageUrl } = body;

      if (isNaN(eventId)) {
        throw new BadRequestException('Event ID must be a valid integer');
      }
      if (title && (typeof title !== 'string' || title.trim().length === 0)) {
        throw new BadRequestException('Title must be a non-empty string');
      }
      if (date && isNaN(new Date(date).getTime())) {
        throw new BadRequestException('Date must be a valid ISO date string');
      }
      if (category && !Object.values(EventCategory).includes(category as EventCategory)) {
        throw new BadRequestException(`Category must be one of ${Object.values(EventCategory).join(', ')}`);
      }
      if (type && !Object.values(EventType).includes(type as EventType)) {
        throw new BadRequestException(`Type must be one of ${Object.values(EventType).join(', ')}`);
      }

      const validatedStatus = status ? this.validateEventStatus(status) : undefined;
      const validatedCategory = category as EventCategory | undefined;
      const validatedType = type as EventType | undefined;
      // Use existingImageUrl if provided, else use uploaded file path
      const imagePath = existingImageUrl || (file ? `/uploads/${file.filename}` : undefined);

      const updatedEvent = await this.eventService.updateEvent(eventId, organizerId, {
        title,
        description,
        date,
        status: validatedStatus,
        location,
        image: imagePath,
        category: validatedCategory,
        type: validatedType,
      });

      return {
        message: 'Event updated successfully',
        event: updatedEvent,
      };
    } catch (error) {
      console.error('🚨 [EventController] Error updating event:', error.message);
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update event: ' + error.message);
    }
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