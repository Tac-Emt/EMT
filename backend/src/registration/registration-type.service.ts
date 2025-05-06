import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrationTypeService {
  constructor(private prisma: PrismaService) {}

  async createRegistrationType(data: {
    eventId: number;
    name: string;
    price?: number;
    capacity?: number;
    startDate: Date;
    endDate: Date;
  }) {
    return this.prisma.registrationType.create({
      data: {
        name: data.name,
        price: data.price,
        capacity: data.capacity,
        startDate: data.startDate,
        endDate: data.endDate,
        event: { connect: { id: data.eventId } },
      },
    });
  }

  async getRegistrationTypes(eventId: number) {
    return this.prisma.registrationType.findMany({
      where: { eventId },
    });
  }

  async getRegistrationType(id: number) {
    const type = await this.prisma.registrationType.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!type) {
      throw new NotFoundException('Registration type not found');
    }

    return type;
  }

  async updateRegistrationType(id: number, data: {
    name?: string;
    price?: number;
    capacity?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const type = await this.prisma.registrationType.findUnique({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException('Registration type not found');
    }

    return this.prisma.registrationType.update({
      where: { id },
      data,
    });
  }

  async deleteRegistrationType(id: number) {
    const type = await this.prisma.registrationType.findUnique({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException('Registration type not found');
    }

    await this.prisma.registrationType.delete({
      where: { id },
    });

    return { message: 'Registration type deleted successfully' };
  }

  async checkAvailability(id: number) {
    const registrationType = await this.prisma.registrationType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    if (!registrationType) {
      throw new NotFoundException('Registration type not found');
    }

    const registeredCount = registrationType._count.registrations;
    
    return {
      available: registrationType.capacity ? registeredCount < registrationType.capacity : true,
      registered: registeredCount,
      capacity: registrationType.capacity,
      remaining: registrationType.capacity ? registrationType.capacity - registeredCount : null,
    };
  }
} 