import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegistrationStatus } from '@prisma/client';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  async createRegistration(data: {
    userId: number;
    eventId: number;
    registrationTypeId: number;
    status?: RegistrationStatus;
    additionalInfo?: any;
  }) {
    try {
      // Check registration type availability
      const registrationType = await this.prisma.registrationType.findUnique({
        where: { id: data.registrationTypeId },
        include: { registrations: true },
      });

      if (!registrationType) {
        throw new NotFoundException('Registration type not found');
      }

      if (registrationType.capacity) {
        const registeredCount = registrationType.registrations.length;
        if (registeredCount >= registrationType.capacity) {
          throw new BadRequestException('Registration type is at full capacity');
        }
      }

      // Check if user is already registered
      const existingRegistration = await this.prisma.registration.findFirst({
        where: {
          userId: data.userId,
          eventId: data.eventId,
        },
      });

      if (existingRegistration) {
        throw new BadRequestException('User is already registered for this event');
      }

      return await this.prisma.registration.create({
        data,
        include: {
          user: true,
          event: true,
          registrationType: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create registration: ' + error.message);
    }
  }

  async getRegistration(id: number) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        user: true,
        event: true,
        registrationType: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async getUserRegistrations(userId: number) {
    return this.prisma.registration.findMany({
      where: { userId },
      include: {
        event: true,
        registrationType: true,
      },
    });
  }

  async getEventRegistrations(eventId: number) {
    return this.prisma.registration.findMany({
      where: { eventId },
      include: {
        user: true,
        registrationType: true,
      },
    });
  }

  async updateRegistrationStatus(
    id: number,
    status: RegistrationStatus,
    additionalInfo?: any,
  ) {
    try {
      return await this.prisma.registration.update({
        where: { id },
        data: {
          status,
          additionalInfo,
        },
        include: {
          user: true,
          event: true,
          registrationType: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Registration not found');
      }
      throw new BadRequestException('Failed to update registration: ' + error.message);
    }
  }

  async deleteRegistration(id: number) {
    try {
      await this.prisma.registration.delete({
        where: { id },
      });
      return { message: 'Registration deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Registration not found');
      }
      throw new BadRequestException('Failed to delete registration: ' + error.message);
    }
  }

  async getRegistrationStats(eventId: number) {
    const registrations = await this.prisma.registration.findMany({
      where: { eventId },
      include: {
        registrationType: true,
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
      const typeName = registration.registrationType.name;
      stats.byType[typeName] = (stats.byType[typeName] || 0) + 1;
    });

    return stats;
  }
} 