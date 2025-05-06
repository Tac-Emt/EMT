import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles';
import { Prisma } from '@prisma/client';

type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';

@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post()
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async createRegistration(
    @Body() data: {
      userId: number;
      eventId: number;
      registrationTypeId: number;
      status: RegistrationStatus;
    },
  ) {
    return this.registrationService.createRegistration(data);
  }

  @Get()
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getRegistrations(
    @Body() filters: {
      userId?: number;
      eventId?: number;
      status?: RegistrationStatus;
    },
  ) {
    return this.registrationService.getRegistrations(filters);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getRegistration(@Param('id') id: string) {
    return this.registrationService.getRegistration(+id);
  }

  @Put(':id')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async updateRegistration(
    @Param('id') id: string,
    @Body() data: {
      status?: RegistrationStatus;
      registrationTypeId?: number;
    },
  ) {
    return this.registrationService.updateRegistration(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async deleteRegistration(@Param('id') id: string) {
    return this.registrationService.deleteRegistration(+id);
  }

  @Get('stats/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getEventRegistrationStats(@Param('eventId') eventId: string) {
    return this.registrationService.getEventRegistrationStats(+eventId);
  }
} 