import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CheckInService {
  constructor(private prisma: PrismaService) {}

  async generateCheckInCode(eventId: number) {
    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      return await this.prisma.checkInCode.create({
        data: {
          eventId,
          code,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
        include: {
          event: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to generate check-in code: ' + error.message);
    }
  }

  async validateCheckInCode(eventId: number, code: string) {
    const checkInCode = await this.prisma.checkInCode.findFirst({
      where: {
        eventId,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!checkInCode) {
      throw new BadRequestException('Invalid or expired check-in code');
    }

    return checkInCode;
  }

  async checkInUser(eventId: number, userId: number, code: string) {
    try {
      // Validate the check-in code
      await this.validateCheckInCode(eventId, code);

      // Check if user is registered for the event
      const registration = await this.prisma.registration.findFirst({
        where: {
          eventId,
          userId,
        },
      });

      if (!registration) {
        throw new BadRequestException('User is not registered for this event');
      }

      // Check if user is already checked in
      const existingCheckIn = await this.prisma.checkIn.findFirst({
        where: {
          eventId,
          userId,
        },
      });

      if (existingCheckIn) {
        throw new BadRequestException('User is already checked in');
      }

      // Create check-in record
      return await this.prisma.checkIn.create({
        data: {
          eventId,
          userId,
          checkedInAt: new Date(),
        },
        include: {
          user: true,
          event: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to check in user: ' + error.message);
    }
  }

  async getEventCheckIns(eventId: number) {
    return this.prisma.checkIn.findMany({
      where: { eventId },
      include: {
        user: true,
      },
    });
  }

  async getUserCheckIns(userId: number) {
    return this.prisma.checkIn.findMany({
      where: { userId },
      include: {
        event: true,
      },
    });
  }

  async getCheckInStats(eventId: number) {
    const [totalRegistrations, totalCheckIns] = await Promise.all([
      this.prisma.registration.count({
        where: { eventId },
      }),
      this.prisma.checkIn.count({
        where: { eventId },
      }),
    ]);

    return {
      totalRegistrations,
      totalCheckIns,
      checkInRate: totalRegistrations > 0 ? (totalCheckIns / totalRegistrations) * 100 : 0,
    };
  }
} 