import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(data: CreateRegistrationDto) {
    try {
      // Check if event exists and has capacity
      const event = await this.prisma.event.findUnique({
        where: { id: data.eventId },
        include: {
          registrations: true,
        },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // Check if user is already registered
      const existingRegistration = await this.prisma.registration.findFirst({
        where: {
          eventId: data.eventId,
          userId: data.userId,
        },
      });

      if (existingRegistration) {
        throw new BadRequestException('User is already registered for this event');
      }

      // Check capacity
      if (event.capacity && event.registrations.length >= event.capacity) {
        // Add to waitlist
        const waitlistRegistration = await this.prisma.registration.create({
          data: {
            ...data,
            status: 'WAITLISTED',
          },
          include: {
            event: true,
            user: true,
          },
        });

        // Send waitlist notification
        await this.emailService.sendWaitlistNotification(
          waitlistRegistration.user.email,
          waitlistRegistration.event,
        );

        return waitlistRegistration;
      }

      // Create registration
      const registration = await this.prisma.registration.create({
        data: {
          ...data,
          status: 'CONFIRMED',
        },
        include: {
          event: true,
          user: true,
        },
      });

      // Send confirmation email
      await this.emailService.sendRegistrationConfirmation(
        registration.user.email,
        registration.event,
      );

      return registration;
    } catch (error) {
      throw new BadRequestException('Failed to create registration: ' + error.message);
    }
  }

  async update(id: number, data: UpdateRegistrationDto) {
    try {
      const registration = await this.prisma.registration.update({
        where: { id },
        data,
        include: {
          event: true,
          user: true,
        },
      });

      // If status changed to CONFIRMED, send confirmation email
      if (data.status === 'CONFIRMED') {
        await this.emailService.sendRegistrationConfirmation(
          registration.user.email,
          registration.event,
        );
      }

      return registration;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Registration not found');
      }
      throw new BadRequestException('Failed to update registration: ' + error.message);
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