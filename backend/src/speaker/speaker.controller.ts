import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('speaker')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SPEAKER')
export class SpeakerController {
  constructor(private speakerService: SpeakerService) {}

  @Get('events')
  async getSpeakerEvents(@Body('speakerId') speakerId: number) {
    try {
      console.log('ℹ️ [SpeakerController] Fetching speaker events:', speakerId);
      const events = await this.speakerService.getSpeakerEvents(speakerId);
      return { message: 'Events fetched successfully', data: events };
    } catch (error) {
      console.error('🚨 [SpeakerController] Error fetching events:', error.message);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch events: ' + error.message);
    }
  }

  @Get('requests')
  async getPendingRequests(@Body('speakerId') speakerId: number) {
    try {
      console.log('ℹ️ [SpeakerController] Fetching pending requests:', speakerId);
      const requests = await this.speakerService.getPendingRequests(speakerId);
      return { message: 'Pending requests fetched successfully', data: requests };
    } catch (error) {
      console.error('🚨 [SpeakerController] Error fetching requests:', error.message);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch requests: ' + error.message);
    }
  }

  @Post('requests/:eventId/respond')
  async respondToRequest(
    @Param('eventId') eventId: string,
    @Body() body: { speakerId: number; accept: boolean },
  ) {
    try {
      const parsedEventId = parseInt(eventId);
      if (isNaN(parsedEventId)) {
        throw new BadRequestException('Event ID must be a valid integer');
      }

      console.log('ℹ️ [SpeakerController] Responding to request:', {
        eventId: parsedEventId,
        speakerId: body.speakerId,
        accept: body.accept,
      });

      const result = await this.speakerService.respondToRequest(
        parsedEventId,
        body.speakerId,
        body.accept,
      );

      return {
        message: `Request ${body.accept ? 'accepted' : 'rejected'} successfully`,
        data: result,
      };
    } catch (error) {
      console.error('🚨 [SpeakerController] Error responding to request:', error.message);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to respond to request: ' + error.message);
    }
  }

  @Get('profile')
  async getSpeakerProfile(@Body('speakerId') speakerId: number) {
    try {
      console.log('ℹ️ [SpeakerController] Fetching speaker profile:', speakerId);
      const profile = await this.speakerService.getSpeakerProfile(speakerId);
      return { message: 'Profile fetched successfully', data: profile };
    } catch (error) {
      console.error('🚨 [SpeakerController] Error fetching profile:', error.message);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch profile: ' + error.message);
    }
  }
} 