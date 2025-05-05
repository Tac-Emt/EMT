import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, RegistrationStatus } from '@prisma/client';

@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @Roles(Role.USER)
  async createRegistration(
    @Body()
    data: {
      userId: number;
      eventId: number;
      registrationTypeId: number;
      status?: RegistrationStatus;
      additionalInfo?: any;
    },
  ) {
    return this.registrationService.createRegistration(data);
  }

  @Get(':id')
  async getRegistration(@Param('id') id: string) {
    return this.registrationService.getRegistration(+id);
  }

  @Get('user/:userId')
  async getUserRegistrations(@Param('userId') userId: string) {
    return this.registrationService.getUserRegistrations(+userId);
  }

  @Get('event/:eventId')
  async getEventRegistrations(@Param('eventId') eventId: string) {
    return this.registrationService.getEventRegistrations(+eventId);
  }

  @Put(':id/status')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async updateRegistrationStatus(
    @Param('id') id: string,
    @Body() data: { status: RegistrationStatus; additionalInfo?: any },
  ) {
    return this.registrationService.updateRegistrationStatus(+id, data.status, data.additionalInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async deleteRegistration(@Param('id') id: string) {
    return this.registrationService.deleteRegistration(+id);
  }

  @Get('event/:eventId/stats')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async getRegistrationStats(@Param('eventId') eventId: string) {
    return this.registrationService.getRegistrationStats(+eventId);
  }
} 