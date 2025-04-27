import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventStatus, EventCategory, EventType, Role } from '@prisma/client';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getFeedEvents(
    organizerIds?: number[],
    categories?: EventCategory[],
    types?: EventType[],
  ) {
    const now = new Date();
    try {
      console.log('🔍 [FeedService] Fetching events with filters', {
        organizerIds,
        categories,
        types,
      });

      
      if (organizerIds?.length) {
        const organizers = await this.prisma.user.findMany({
          where: {
            id: { in: organizerIds },
            role: Role.ORGANIZER,
          },
        });
        if (organizers.length !== organizerIds.length) {
          const invalidIds = organizerIds.filter(
            id => !organizers.some(org => org.id === id),
          );
          throw new BadRequestException(
            `Invalid organizer IDs: ${invalidIds.join(', ')}`,
          );
        }
      }

      
      if (categories?.length) {
        const validCategories = Object.values(EventCategory);
        const invalidCategories = categories.filter(
          c => !validCategories.includes(c),
        );
        if (invalidCategories.length) {
          throw new BadRequestException(
            `Invalid categories: ${invalidCategories.join(', ')}. Must be one of ${validCategories.join(', ')}`,
          );
        }
      }

      
      if (types?.length) {
        const validTypes = Object.values(EventType);
        const invalidTypes = types.filter(t => !validTypes.includes(t));
        if (invalidTypes.length) {
          throw new BadRequestException(
            `Invalid types: ${invalidTypes.join(', ')}. Must be one of ${validTypes.join(', ')}`,
          );
        }
      }

      const events = await this.prisma.event.findMany({
        where: {
          date: { gt: now },
          status: EventStatus.PUBLISHED,
          ...(organizerIds?.length
            ? { organizers: { some: { organizerId: { in: organizerIds } } } }
            : {}),
          ...(categories?.length ? { category: { in: categories } } : {}),
          ...(types?.length ? { type: { in: types } } : {}),
        },
        include: {
          organizers: {
            include: {
              organizer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      const formattedEvents = events.map(event => ({
        ...event,
        image: event.image ? `data:image/jpeg;base64,${event.image}` : null,
        organizers: event.organizers.map(o => ({
          id: o.organizer.id,
          name: o.organizer.name,
          isHost: o.isHost,
        })),
      }));

      console.log(
        '✅ [FeedService] Fetched',
        formattedEvents.length,
        'events with filters',
      );
      return formattedEvents;
    } catch (error) {
      console.error('🚨 [FeedService] Error fetching events:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch feed events: ' + error.message);
    }
  }

  async getFilterOptions() {
    try {
      console.log('🔍 [FeedService] Fetching filter options');

      const organizers = await this.prisma.user.findMany({
        where: {
          role: Role.ORGANIZER,
          organizedEvents: {
            some: {
              event: {
                status: EventStatus.PUBLISHED,
                date: { gt: new Date() },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      const categories = Object.values(EventCategory);
      const types = Object.values(EventType);

      console.log('✅ [FeedService] Fetched filter options');
      return { organizers, categories, types };
    } catch (error) {
      console.error('🚨 [FeedService] Error fetching filter options:', error.message);
      throw new InternalServerErrorException('Failed to fetch filter options: ' + error.message);
    }
  }
}