import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SpeakerFeedbackService } from './speaker-feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles';

@Controller('speaker-feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpeakerFeedbackController {
  constructor(private speakerFeedbackService: SpeakerFeedbackService) {}

  @Post()
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async createFeedback(
    @Body() data: {
      eventId: number;
      speakerId: number;
      userId: number;
      rating: number;
      comment?: string;
    },
  ) {
    return this.speakerFeedbackService.createFeedback(data);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getFeedback(@Param('id') id: string) {
    return this.speakerFeedbackService.getFeedback(+id);
  }

  @Get('event/:eventId')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getEventFeedbacks(@Param('eventId') eventId: string) {
    return this.speakerFeedbackService.getEventFeedbacks(+eventId);
  }

  @Get('speaker/:speakerId')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getSpeakerFeedbacks(@Param('speakerId') speakerId: string) {
    return this.speakerFeedbackService.getSpeakerFeedbacks(+speakerId);
  }

  @Put(':id')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
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
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async deleteFeedback(@Param('id') id: string) {
    return this.speakerFeedbackService.deleteFeedback(+id);
  }

  @Get('speaker/:speakerId/stats')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getSpeakerStats(@Param('speakerId') speakerId: string) {
    return this.speakerFeedbackService.getSpeakerStats(+speakerId);
  }
} 