import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SpeakerFeedbackService } from './speaker-feedback.service';

@Controller('speaker-feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpeakerFeedbackController {
  constructor(private readonly speakerFeedbackService: SpeakerFeedbackService) {}

  @Post()
  @Roles('USER')
  async createFeedback(@Body() data: {
    eventId: number;
    speakerId: number;
    userId: number;
    rating: number;
    comment?: string;
  }) {
    return this.speakerFeedbackService.createFeedback(data);
  }

  @Get(':id')
  @Roles('ADMIN', 'ORGANIZER', 'SPEAKER')
  async getFeedback(@Param('id') id: string) {
    return this.speakerFeedbackService.getFeedback(+id);
  }

  @Get('event/:eventId')
  @Roles('ADMIN', 'ORGANIZER', 'SPEAKER')
  async getEventFeedback(@Param('eventId') eventId: string) {
    return this.speakerFeedbackService.getEventFeedback(+eventId);
  }

  @Get('speaker/:speakerId')
  @Roles('ADMIN', 'ORGANIZER', 'SPEAKER')
  async getSpeakerFeedback(@Param('speakerId') speakerId: string) {
    return this.speakerFeedbackService.getSpeakerFeedback(+speakerId);
  }

  @Put(':id')
  @Roles('USER')
  async updateFeedback(
    @Param('id') id: string,
    @Body() data: {
      rating?: number;
      comment?: string;
    },
  ) {
    return this.speakerFeedbackService.updateFeedback(+id, data);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async deleteFeedback(@Param('id') id: string) {
    return this.speakerFeedbackService.deleteFeedback(+id);
  }

  @Get('stats/:speakerId')
  @Roles('ADMIN', 'ORGANIZER', 'SPEAKER')
  async getFeedbackStats(@Param('speakerId') speakerId: string) {
    return this.speakerFeedbackService.getFeedbackStats(+speakerId);
  }
} 