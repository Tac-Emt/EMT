import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles';

@Controller('check-in')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckInController {
  constructor(private checkInService: CheckInService) {}

  @Post('generate/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async generateCheckInCode(@Param('eventId') eventId: string) {
    return this.checkInService.generateCheckInCode(+eventId);
  }

  @Post(':eventId/user/:userId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async checkInUser(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() data: { code: string },
  ) {
    return this.checkInService.checkInUser({
      eventId: +eventId,
      userId: +userId,
      code: data.code,
    });
  }

  @Get('event/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getEventCheckIns(@Param('eventId') eventId: string) {
    return this.checkInService.getEventCheckIns(+eventId);
  }

  @Get('user/:userId')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getUserCheckIns(@Param('userId') userId: string) {
    return this.checkInService.getUserCheckIns(+userId);
  }

  @Get('stats/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getEventCheckInStats(@Param('eventId') eventId: string) {
    return this.checkInService.getEventCheckInStats(+eventId);
  }
} 