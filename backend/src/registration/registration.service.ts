import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RegistrationStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createRegistration(data: {
    userId: number;
    eventId: number;
    registrationTypeId: number;
    status: RegistrationStatus;
  }) {
    return this.prisma.registration.create({
      data: {
        status: data.status,
        user: { connect: { id: data.userId } },
        event: { connect: { id: data.eventId } },
        type: { connect: { id: data.registrationTypeId } },
      },
      include: {
        user: true,
        event: true,
        type: true,
      },
    });
  }

  async getRegistrations(filters: {
    userId?: number;
    eventId?: number;
    status?: RegistrationStatus;
  }) {
    return this.prisma.registration.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.eventId && { eventId: filters.eventId }),
        ...(filters.status && { status: filters.status }),
      },
      include: {
        user: true,
        event: true,
        type: true,
      },
    });
  }

  async getRegistration(id: number) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        user: true,
        event: true,
        type: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async updateRegistration(id: number, data: {
    status?: RegistrationStatus;
    registrationTypeId?: number;
  }) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return this.prisma.registration.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.registrationTypeId && {
          type: { connect: { id: data.registrationTypeId } },
        }),
      },
      include: {
        user: true,
        event: true,
        type: true,
      },
    });
  }

  async deleteRegistration(id: number) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    await this.prisma.registration.delete({
      where: { id },
    });

    return { message: 'Registration deleted successfully' };
  }

  async getEventRegistrationStats(eventId: number) {
    const registrations = await this.prisma.registration.findMany({
      where: { eventId },
      include: {
        type: true,
      },
    });

    const stats = {
      total: registrations.length,
      byStatus: {},
      byType: {},
    };

    registrations.forEach((registration) => {
      // Count by status
      stats.byStatus[registration.status] = (stats.byStatus[registration.status] || 0) + 1;

      // Count by registration type
      const typeName = registration.type.name;
      stats.byType[typeName] = (stats.byType[typeName] || 0) + 1;
    });

    return stats;
  }
} 