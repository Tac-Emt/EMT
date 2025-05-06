import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { SpeakerProfileService } from './speaker-profile.service';

@Controller('speaker/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SPEAKER)
export class SpeakerProfileController {
  constructor(private speakerProfileService: SpeakerProfileService) {}

  @Get()
  async getProfile(@Request() req) {
    return this.speakerProfileService.getProfile(req.user.id);
  }

  @Put()
  async updateProfile(@Request() req, @Body() data: {
    bio?: string;
    photo?: string;
    organization?: string;
    title?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  }) {
    return this.speakerProfileService.updateProfile(req.user.id, data);
  }
} 