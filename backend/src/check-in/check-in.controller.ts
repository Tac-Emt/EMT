import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('check-in')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post('event/:eventId/generate-code')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async generateCheckInCode(@Param('eventId') eventId: string) {
    return this.checkInService.generateCheckInCode(+eventId);
  }

  @Post('event/:eventId/user/:userId')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async checkInUser(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() data: { code: string },
  ) {
    return this.checkInService.checkInUser(+eventId, +userId, data.code);
  }

  @Get('event/:eventId')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async getEventCheckIns(@Param('eventId') eventId: string) {
    return this.checkInService.getEventCheckIns(+eventId);
  }

  @Get('user/:userId')
  async getUserCheckIns(@Param('userId') userId: string) {
    return this.checkInService.getUserCheckIns(+userId);
  }

  @Get('event/:eventId/stats')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async getCheckInStats(@Param('eventId') eventId: string) {
    return this.checkInService.getCheckInStats(+eventId);
  }
} 