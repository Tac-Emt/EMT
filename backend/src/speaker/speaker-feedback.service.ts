import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    return this.prisma.speakerFeedback.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        event: { connect: { id: data.eventId } },
        speaker: { connect: { id: data.speakerId } },
        user: { connect: { id: data.userId } },
      },
      include: {
        event: true,
        speaker: true,
        user: true,
      },
    });
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

  async getSpeakerFeedbacks(speakerId: number) {
    return this.prisma.speakerFeedback.findMany({
      where: { speakerId },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async getEventFeedbacks(eventId: number) {
    return this.prisma.speakerFeedback.findMany({
      where: { eventId },
      include: {
        speaker: true,
        user: true,
      },
    });
  }

  async updateFeedback(id: number, data: {
    rating?: number;
    comment?: string;
  }) {
    const feedback = await this.prisma.speakerFeedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return this.prisma.speakerFeedback.update({
      where: { id },
      data,
      include: {
        event: true,
        speaker: true,
        user: true,
      },
    });
  }

  async deleteFeedback(id: number) {
    const feedback = await this.prisma.speakerFeedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    await this.prisma.speakerFeedback.delete({
      where: { id },
    });

    return { message: 'Feedback deleted successfully' };
  }

  async getSpeakerStats(speakerId: number) {
    const feedbacks = await this.prisma.speakerFeedback.findMany({
      where: { speakerId },
    });

    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = feedbacks.length > 0 ? totalRating / feedbacks.length : 0;

    return {
      totalFeedbacks: feedbacks.length,
      averageRating,
      ratingDistribution: this.getRatingDistribution(feedbacks),
    };
  }

  private getRatingDistribution(feedbacks: { rating: number }[]) {
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    feedbacks.forEach((feedback) => {
      distribution[feedback.rating]++;
    });

    return distribution;
  }
} 