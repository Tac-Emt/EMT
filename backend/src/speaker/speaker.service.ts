import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

export enum SpeakerStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Injectable()
export class SpeakerService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createSpeaker(data: {
    name: string;
    email: string;
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
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
        photo: data.photo,
        organization: data.organization,
        title: data.title,
        socialLinks: data.socialLinks,
        role: 'SPEAKER',
        password: 'temporary-password-' + Math.random().toString(36).substring(2),
      },
    });
  }

  async getSpeakers() {
    return this.prisma.user.findMany({
      where: { role: 'SPEAKER' },
      include: {
        _count: {
          select: {
            speakerEvents: {
              where: {
                status: SpeakerStatus.ACCEPTED,
              },
            },
          },
        },
      },
    });
  }

  async getSpeaker(id: number) {
    const speaker = await this.prisma.user.findFirst({
      where: { 
        id,
        role: 'SPEAKER'
      },
      include: {
        speakerEvents: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    return speaker;
  }

  async updateSpeaker(id: number, data: {
    name?: string;
    email?: string;
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

    if (speaker.photo && data.photo && speaker.photo !== data.photo) {
      // Delete old photo if exists
      // await this.fileUploadService.deleteFile(speaker.photo);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteSpeaker(id: number) {
    const speaker = await this.prisma.user.findFirst({
      where: { 
        id,
        role: 'SPEAKER'
      },
    });

    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    if (speaker.photo) {
      // Delete photo if exists
      // await this.fileUploadService.deleteFile(speaker.photo);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Speaker deleted successfully' };
  }

  async getSpeakerStats(id: number) {
    const speaker = await this.prisma.user.findFirst({
      where: { 
        id,
        role: 'SPEAKER'
      },
      include: {
        _count: {
          select: {
            speakerEvents: {
              where: {
                status: SpeakerStatus.ACCEPTED,
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
      totalEvents: speaker._count.speakerEvents,
    };
  }

  async getSpeakerEvents(speakerId: number) {
    const events = await this.prisma.eventSpeaker.findMany({
      where: { speakerId },
      include: {
        event: {
          include: {
            organizers: {
              include: {
                organizer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { event: { date: 'asc' } },
    });

    return events;
  }

  async getPendingRequests(speakerId: number) {
    return this.prisma.eventSpeaker.findMany({
      where: {
        speakerId,
        status: SpeakerStatus.PENDING,
      },
      include: {
        event: {
          include: {
            organizers: {
              include: {
                organizer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToRequest(eventId: number, speakerId: number, accept: boolean) {
    const eventSpeaker = await this.prisma.eventSpeaker.findUnique({
      where: {
        eventId_speakerId: {
          eventId,
          speakerId,
        },
      },
      include: {
        event: {
          include: {
            organizers: {
              include: {
                organizer: true,
              },
            },
          },
        },
      },
    });

    if (!eventSpeaker) {
      throw new NotFoundException('Speaker request not found');
    }

    if (eventSpeaker.status !== SpeakerStatus.PENDING) {
      throw new BadRequestException('This request has already been processed');
    }

    const status = accept ? SpeakerStatus.ACCEPTED : SpeakerStatus.REJECTED;
    const updatedEventSpeaker = await this.prisma.eventSpeaker.update({
      where: {
        eventId_speakerId: {
          eventId,
          speakerId,
        },
      },
      data: { status },
      include: {
        event: true,
      },
    });

    // Notify event organizers
    const host = eventSpeaker.event.organizers.find(o => o.isHost)?.organizer;
    if (host) {
      await this.emailService.sendMail({
        to: host.email,
        subject: `Speaker ${accept ? 'Accepted' : 'Rejected'} Request`,
        text: `The speaker has ${accept ? 'accepted' : 'rejected'} the request to speak at "${eventSpeaker.event.title}".`,
      });
    }

    return updatedEventSpeaker;
  }

  async getSpeakerProfile(speakerId: number) {
    const speaker = await this.prisma.user.findFirst({
      where: { 
        id: speakerId,
        role: 'SPEAKER'
      },
      include: {
        _count: {
          select: {
            speakerEvents: {
              where: {
                status: SpeakerStatus.ACCEPTED,
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
      id: speaker.id,
      name: speaker.name,
      email: speaker.email,
      totalEvents: speaker._count.speakerEvents,
    };
  }
} 