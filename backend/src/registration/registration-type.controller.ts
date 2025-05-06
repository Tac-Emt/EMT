import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RegistrationTypeService } from './registration-type.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@Controller('registration-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationTypeController {
  constructor(private registrationTypeService: RegistrationTypeService) {}

  @Post()
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async createRegistrationType(
    @Body() data: {
      eventId: number;
      name: string;
      price?: number;
      capacity?: number;
      startDate: Date;
      endDate: Date;
    },
  ) {
    return this.registrationTypeService.createRegistrationType(data);
  }

  @Get('event/:eventId')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getRegistrationTypes(@Param('eventId') eventId: string) {
    return this.registrationTypeService.getRegistrationTypes(+eventId);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN)
  async getRegistrationType(@Param('id') id: string) {
    return this.registrationTypeService.getRegistrationType(+id);
  }

  @Put(':id')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async updateRegistrationType(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      price?: number;
      capacity?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.registrationTypeService.updateRegistrationType(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async deleteRegistrationType(@Param('id') id: string) {
    return this.registrationTypeService.deleteRegistrationType(+id);
  }

  @Get(':id/availability')
  async checkAvailability(@Param('id') id: string) {
    return this.registrationTypeService.checkAvailability(+id);
  }
} 