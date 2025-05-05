import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventSeriesService {
  constructor(private prisma: PrismaService) {}

  async createSeries(data: { name: string; description?: string }) {
    try {
      return await this.prisma.eventSeries.create({
        data,
        include: {
          events: {
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
      });
    } catch (error) {
      throw new BadRequestException('Failed to create event series: ' + error.message);
    }
  }

  async getSeries(id: number) {
    const series = await this.prisma.eventSeries.findUnique({
      where: { id },
      include: {
        events: {
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
    });

    if (!series) {
      throw new NotFoundException('Event series not found');
    }

    return series;
  }

  async getAllSeries() {
    return this.prisma.eventSeries.findMany({
      include: {
        events: {
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
    });
  }

  async updateSeries(id: number, data: { name?: string; description?: string }) {
    try {
      return await this.prisma.eventSeries.update({
        where: { id },
        data,
        include: {
          events: {
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
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Event series not found');
      }
      throw new BadRequestException('Failed to update event series: ' + error.message);
    }
  }

  async deleteSeries(id: number) {
    try {
      await this.prisma.eventSeries.delete({
        where: { id },
      });
      return { message: 'Event series deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Event series not found');
      }
      throw new BadRequestException('Failed to delete event series: ' + error.message);
    }
  }

  async addEventToSeries(seriesId: number, eventId: number) {
    try {
      return await this.prisma.event.update({
        where: { id: eventId },
        data: {
          series: {
            connect: { id: seriesId },
          },
        },
        include: {
          series: true,
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
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Event or series not found');
      }
      throw new BadRequestException('Failed to add event to series: ' + error.message);
    }
  }

  async removeEventFromSeries(seriesId: number, eventId: number) {
    try {
      return await this.prisma.event.update({
        where: { id: eventId },
        data: {
          series: {
            disconnect: { id: seriesId },
          },
        },
        include: {
          series: true,
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
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Event or series not found');
      }
      throw new BadRequestException('Failed to remove event from series: ' + error.message);
    }
  }
} 