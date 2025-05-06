import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { EventStatus, EventCategory, EventType } from '@prisma/client';
import { Role } from '../auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private userService: UserService,
  ) {}

  @Get('users')
  async getAllUsers() {
    try {
      console.log('ℹ️ [AdminController] Fetching all users');
      const users = await this.adminService.getAllUsers();
      return { message: 'Users fetched successfully', data: users };
    } catch (error) {
      console.error('🚨 [AdminController] Error fetching users:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch users: ' + error.message);
    }
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const { email, password, name, role } = createUserDto;
      if (!email || !password || !name || !role) {
        throw new BadRequestException('Email, password, name, and role are required');
      }
      const validRoles = Object.values(Role);
      if (!validRoles.includes(role as Role)) {
        throw new BadRequestException(`Invalid role value: ${role}. Must be one of ${validRoles.join(', ')}`);
      }
      console.log('ℹ️ [AdminController] Creating user:', { email, name, role });
      const newUser = await this.adminService.createUser(email, password, name, role as Role);
      return { message: 'User created successfully', data: newUser };
    } catch (error) {
      console.error('🚨 [AdminController] Error creating user:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create user: ' + error.message);
    }
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: { email?: string; name?: string; role?: string }) {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) throw new BadRequestException('User ID must be a valid integer');
      if (data.role) {
        const validRoles = Object.values(Role);
        if (!validRoles.includes(data.role as Role)) {
          throw new BadRequestException(`Invalid role value: ${data.role}. Must be one of ${validRoles.join(', ')}`);
        }
      }
      console.log('ℹ️ [AdminController] Updating user:', { id: userId, data });
      const updatedUser = await this.adminService.updateUser(userId, {
        ...data,
        role: data.role as Role | undefined
      });
      return { message: 'User updated successfully', data: updatedUser };
    } catch (error) {
      console.error('🚨 [AdminController] Error updating user:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update user: ' + error.message);
    }
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) throw new BadRequestException('User ID must be a valid integer');
      console.log('ℹ️ [AdminController] Deleting user:', userId);
      const result = await this.adminService.deleteUser(userId);
      return result;
    } catch (error) {
      console.error('🚨 [AdminController] Error deleting user:', error.message);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user: ' + error.message);
    }
  }

  @Get('events')
  async getAllEvents() {
    try {
      console.log('ℹ️ [AdminController] Fetching all events');
      const events = await this.adminService.getAllEvents();
      return { message: 'Events fetched successfully', data: events };
    } catch (error) {
      console.error('🚨 [AdminController] Error fetching events:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch events: ' + error.message);
    }
  }

  @Post('events')
  @Roles('ADMIN')
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
      organizerIds: number[];
      speakerRequests?: { speakerId: number; topic?: string; description?: string }[];
    },
  ) {
    try {
      console.log('ℹ️ [AdminController] Creating event:', { data });
      const event = await this.adminService.createEvent(data);
      return { message: 'Event created successfully', data: event };
    } catch (error) {
      console.error('🚨 [AdminController] Error creating event:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create event: ' + error.message);
    }
  }

  @Put('events/:id')
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
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateEvent(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      title?: string;
      description?: string;
      date?: string;
      organizerId?: string;
      status?: string;
      location?: string;
      category?: string;
      type?: string;
      existingImageUrl?: string;
      registrationLink?: string;
      pageContent?: any;
      pageSettings?: any;
    },
  ) {
    try {
      const eventId = parseInt(id);
      if (isNaN(eventId)) throw new BadRequestException('Event ID must be a valid integer');

      const { title, description, date, organizerId, status, location, category, type, existingImageUrl, registrationLink, pageContent, pageSettings } = body;

      if (title && (typeof title !== 'string' || title.trim().length === 0)) {
        throw new BadRequestException('Title must be a non-empty string');
      }
      if (date && isNaN(new Date(date).getTime())) {
        throw new BadRequestException('Date must be a valid ISO date string');
      }
      if (organizerId) {
        const parsedOrganizerId = parseInt(organizerId);
        if (isNaN(parsedOrganizerId)) throw new BadRequestException('Organizer ID must be a valid integer');
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
      const parsedOrganizerId = organizerId ? parseInt(organizerId) : undefined;
      // Use existingImageUrl if provided, else use uploaded file path
      const imagePath = existingImageUrl || (file ? `/uploads/${file.filename}` : undefined);

      console.log('ℹ️ [AdminController] Updating event:', { id: eventId, data: body, imagePath });
      const updatedEvent = await this.adminService.updateEvent(eventId, {
        title,
        description,
        date,
        organizerId: parsedOrganizerId,
        status: validatedStatus,
        location,
        image: imagePath,
        category: validatedCategory,
        type: validatedType,
        registrationLink,
        pageContent,
        pageSettings,
      });

      return { message: 'Event updated successfully', data: updatedEvent };
    } catch (error) {
      console.error('🚨 [AdminController] Error updating event:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update event: ' + error.message);
    }
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string) {
    try {
      const eventId = parseInt(id);
      if (isNaN(eventId)) throw new BadRequestException('Event ID must be a valid integer');
      console.log('ℹ️ [AdminController] Deleting event:', eventId);
      const result = await this.adminService.deleteEvent(eventId);
      return result;
    } catch (error) {
      console.error('🚨 [AdminController] Error deleting event:', error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to delete event: ' + error.message);
    }
  }

  @Post('events/:id/confirm')
  async confirmEventParticipation(@Param('id') id: string, @Body() body: { confirm: boolean; organizerId: string }) {
    try {
      const eventId = parseInt(id);
      if (isNaN(eventId)) throw new BadRequestException('Event ID must be a valid integer');
      if (typeof body.confirm !== 'boolean') throw new BadRequestException('Confirm must be a boolean');

      const { organizerId } = body;
      const parsedOrganizerId = parseInt(organizerId);
      if (isNaN(parsedOrganizerId)) throw new BadRequestException('Organizer ID must be a valid integer');

      console.log('ℹ️ [AdminController] Confirming participation:', { eventId, organizerId: parsedOrganizerId, confirm: body.confirm });
      const result = await this.adminService.confirmEventParticipation(eventId, parsedOrganizerId, body.confirm);
      return { message: result.message, data: null };
    } catch (error) {
      console.error('🚨 [AdminController] Error confirming participation:', error.message);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to confirm participation: ' + error.message);
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