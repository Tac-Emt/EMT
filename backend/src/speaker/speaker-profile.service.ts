import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpeakerProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(data: {
    userId: number;
    bio?: string;
    expertise?: string[];
    website?: string;
    socialLinks?: any;
    availability?: any;
  }) {
    try {
      return await this.prisma.speakerProfile.create({
        data,
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create speaker profile: ' + error.message);
    }
  }

  async getProfile(id: number) {
    const profile = await this.prisma.speakerProfile.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Speaker profile not found');
    }

    return profile;
  }

  async getUserProfile(userId: number) {
    const profile = await this.prisma.speakerProfile.findFirst({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Speaker profile not found');
    }

    return profile;
  }

  async updateProfile(
    id: number,
    data: {
      bio?: string;
      expertise?: string[];
      website?: string;
      socialLinks?: any;
      availability?: any;
    },
  ) {
    try {
      return await this.prisma.speakerProfile.update({
        where: { id },
        data,
        include: {
          user: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Speaker profile not found');
      }
      throw new BadRequestException('Failed to update speaker profile: ' + error.message);
    }
  }

  async deleteProfile(id: number) {
    try {
      await this.prisma.speakerProfile.delete({
        where: { id },
      });
      return { message: 'Speaker profile deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Speaker profile not found');
      }
      throw new BadRequestException('Failed to delete speaker profile: ' + error.message);
    }
  }

  async getSpeakerEvents(userId: number) {
    const profile = await this.getUserProfile(userId);
    return this.prisma.eventSpeaker.findMany({
      where: { speakerId: userId },
      include: {
        event: true,
      },
    });
  }

  async getSpeakerStats(userId: number) {
    const [profile, events, feedback] = await Promise.all([
      this.getUserProfile(userId),
      this.prisma.eventSpeaker.findMany({
        where: { speakerId: userId },
        include: { event: true },
      }),
      this.prisma.speakerFeedback.findMany({
        where: { speakerId: userId },
      }),
    ]);

    const stats = {
      totalEvents: events.length,
      upcomingEvents: events.filter((e) => e.event.date > new Date()).length,
      pastEvents: events.filter((e) => e.event.date <= new Date()).length,
      averageRating:
        feedback.length > 0
          ? feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length
          : 0,
      totalFeedback: feedback.length,
    };

    return stats;
  }
} 