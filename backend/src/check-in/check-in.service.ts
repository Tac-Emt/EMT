import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CheckInService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async generateCheckInCode(eventId: number) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return this.prisma.checkInCode.create({
      data: {
        code,
        event: { connect: { id: eventId } },
      },
    });
  }

  async validateCheckInCode(code: string) {
    const checkInCode = await this.prisma.checkInCode.findFirst({
      where: {
        code,
        used: false,
      },
      include: {
        event: true,
      },
    });

    if (!checkInCode) {
      throw new NotFoundException('Invalid or expired check-in code');
    }

    return checkInCode;
  }

  async checkInUser(data: {
    eventId: number;
    userId: number;
    code: string;
  }) {
    const checkInCode = await this.validateCheckInCode(data.code);

    if (checkInCode.eventId !== data.eventId) {
      throw new BadRequestException('Check-in code is not valid for this event');
    }

    const registration = await this.prisma.registration.findFirst({
      where: {
        eventId: data.eventId,
        userId: data.userId,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.checkedIn) {
      throw new BadRequestException('User is already checked in');
    }

    // Update registration with check-in
    const updatedRegistration = await this.prisma.registration.update({
      where: { id: registration.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkInCode: {
          connect: { id: checkInCode.id },
        },
      },
      include: {
        user: true,
        event: true,
      },
    });

    // Mark check-in code as used
    await this.prisma.checkInCode.update({
      where: { id: checkInCode.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    return updatedRegistration;
  }

  async getEventCheckIns(eventId: number) {
    return this.prisma.registration.findMany({
      where: {
        eventId,
        checkedIn: true,
      },
      include: {
        user: true,
      },
    });
  }

  async getUserCheckIns(userId: number) {
    return this.prisma.registration.findMany({
      where: {
        userId,
        checkedIn: true,
      },
      include: {
        event: true,
      },
    });
  }

  async getEventCheckInStats(eventId: number) {
    const totalRegistrations = await this.prisma.registration.count({
      where: { eventId },
    });

    const checkedInCount = await this.prisma.registration.count({
      where: {
        eventId,
        checkedIn: true,
      },
    });

    return {
      totalRegistrations,
      checkedInCount,
      checkInRate: totalRegistrations > 0 ? (checkedInCount / totalRegistrations) * 100 : 0,
    };
  }
} 