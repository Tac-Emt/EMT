import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RegistrationTypeService {
  constructor(private prisma: PrismaService) {}

  async createRegistrationType(data: {
    eventId: number;
    name: string;
    description?: string;
    price?: number;
    capacity?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      return await this.prisma.registrationType.create({
        data,
        include: {
          event: true,
          registrations: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create registration type: ' + error.message);
    }
  }

  async getRegistrationType(id: number) {
    const registrationType = await this.prisma.registrationType.findUnique({
      where: { id },
      include: {
        event: true,
        registrations: true,
      },
    });

    if (!registrationType) {
      throw new NotFoundException('Registration type not found');
    }

    return registrationType;
  }

  async getEventRegistrationTypes(eventId: number) {
    return this.prisma.registrationType.findMany({
      where: { eventId },
      include: {
        registrations: true,
      },
    });
  }

  async updateRegistrationType(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      capacity?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    try {
      return await this.prisma.registrationType.update({
        where: { id },
        data,
        include: {
          event: true,
          registrations: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Registration type not found');
      }
      throw new BadRequestException('Failed to update registration type: ' + error.message);
    }
  }

  async deleteRegistrationType(id: number) {
    try {
      await this.prisma.registrationType.delete({
        where: { id },
      });
      return { message: 'Registration type deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Registration type not found');
      }
      throw new BadRequestException('Failed to delete registration type: ' + error.message);
    }
  }

  async checkAvailability(id: number) {
    const registrationType = await this.getRegistrationType(id);
    const registeredCount = registrationType.registrations.length;
    
    return {
      available: registrationType.capacity ? registeredCount < registrationType.capacity : true,
      registered: registeredCount,
      capacity: registrationType.capacity,
      remaining: registrationType.capacity ? registrationType.capacity - registeredCount : null,
    };
  }
} 