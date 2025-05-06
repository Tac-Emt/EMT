import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const speaker = await this.prisma.user.findFirst({
      where: { 
        id,
        role: 'SPEAKER'
      },
      include: {
        speakerProfile: true,
        _count: {
          select: {
            speakerEvents: {
              where: {
                status: 'ACCEPTED',
              },
            },
          },
        },
      },
    });

    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    return {
      ...speaker,
      totalEvents: speaker._count.speakerEvents,
    };
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

  async updateProfile(id: number, data: {
    bio?: string;
    photo?: string;
    organization?: string;
    title?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  }) {
    const speaker = await this.prisma.user.findFirst({
      where: { 
        id,
        role: 'SPEAKER'
      },
    });

    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    // Update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        bio: data.bio,
        photo: data.photo,
        organization: data.organization,
        title: data.title,
        socialLinks: data.socialLinks,
      },
      include: {
        speakerProfile: true,
      },
    });

    return updatedUser;
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