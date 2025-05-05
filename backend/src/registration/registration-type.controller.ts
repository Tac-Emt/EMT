import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RegistrationTypeService } from './registration-type.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('registration-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationTypeController {
  constructor(private readonly registrationTypeService: RegistrationTypeService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async createRegistrationType(
    @Body()
    data: {
      eventId: number;
      name: string;
      description?: string;
      price?: number;
      capacity?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.registrationTypeService.createRegistrationType(data);
  }

  @Get()
  async getAllRegistrationTypes() {
    return this.registrationTypeService.getEventRegistrationTypes(0);
  }

  @Get(':id')
  async getRegistrationType(@Param('id') id: string) {
    return this.registrationTypeService.getRegistrationType(+id);
  }

  @Get('event/:eventId')
  async getEventRegistrationTypes(@Param('eventId') eventId: string) {
    return this.registrationTypeService.getEventRegistrationTypes(+eventId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async updateRegistrationType(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      price?: number;
      capacity?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.registrationTypeService.updateRegistrationType(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async deleteRegistrationType(@Param('id') id: string) {
    return this.registrationTypeService.deleteRegistrationType(+id);
  }

  @Get(':id/availability')
  async checkAvailability(@Param('id') id: string) {
    return this.registrationTypeService.checkAvailability(+id);
  }
} 