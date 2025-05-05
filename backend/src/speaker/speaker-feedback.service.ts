import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpeakerFeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(data: {
    eventId: number;
    speakerId: number;
    userId: number;
    rating: number;
    comment?: string;
  }) {
    try {
      // Check if user has already provided feedback
      const existingFeedback = await this.prisma.speakerFeedback.findFirst({
        where: {
          eventId: data.eventId,
          speakerId: data.speakerId,
          userId: data.userId,
        },
      });

      if (existingFeedback) {
        throw new BadRequestException('User has already provided feedback for this speaker');
      }

      return await this.prisma.speakerFeedback.create({
        data,
        include: {
          event: true,
          speaker: true,
          user: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create feedback: ' + error.message);
    }
  }

  async getFeedback(id: number) {
    const feedback = await this.prisma.speakerFeedback.findUnique({
      where: { id },
      include: {
        event: true,
        speaker: true,
        user: true,
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async getEventFeedback(eventId: number) {
    return this.prisma.speakerFeedback.findMany({
      where: { eventId },
      include: {
        speaker: true,
        user: true,
      },
    });
  }

  async getSpeakerFeedback(speakerId: number) {
    return this.prisma.speakerFeedback.findMany({
      where: { speakerId },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async updateFeedback(
    id: number,
    data: {
      rating?: number;
      comment?: string;
    },
  ) {
    try {
      return await this.prisma.speakerFeedback.update({
        where: { id },
        data,
        include: {
          event: true,
          speaker: true,
          user: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Feedback not found');
      }
      throw new BadRequestException('Failed to update feedback: ' + error.message);
    }
  }

  async deleteFeedback(id: number) {
    try {
      await this.prisma.speakerFeedback.delete({
        where: { id },
      });
      return { message: 'Feedback deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Feedback not found');
      }
      throw new BadRequestException('Failed to delete feedback: ' + error.message);
    }
  }

  async getFeedbackStats(speakerId: number) {
    const feedback = await this.prisma.speakerFeedback.findMany({
      where: { speakerId },
    });

    const stats = {
      total: feedback.length,
      averageRating:
        feedback.length > 0
          ? feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length
          : 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };

    feedback.forEach((f) => {
      stats.ratingDistribution[f.rating]++;
    });

    return stats;
  }
} 