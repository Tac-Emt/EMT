import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { FeedService } from './feed.service';
import { EventCategory, EventType } from '@prisma/client';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('events')
  async getFeedEvents(
    @Query('organizerIds') organizerIds?: string,
    @Query('categories') categories?: string,
    @Query('types') types?: string,
  ) {
    try {
      
      let parsedOrganizerIds: number[] | undefined;
      if (organizerIds) {
        parsedOrganizerIds = organizerIds.split(',').map(id => {
          const parsed = parseInt(id.trim());
          if (isNaN(parsed)) {
            throw new BadRequestException(`Invalid organizer ID: ${id}`);
          }
          return parsed;
        });
        if (!parsedOrganizerIds.length) {
          parsedOrganizerIds = undefined;
        }
      }

      
      let parsedCategories: EventCategory[] | undefined;
      if (categories) {
        parsedCategories = categories
          .split(',')
          .map(c => c.trim() as EventCategory)
          .filter(c => c);
        if (!parsedCategories.length) {
          parsedCategories = undefined;
        }
      }

      
      let parsedTypes: EventType[] | undefined;
      if (types) {
        parsedTypes = types
          .split(',')
          .map(t => t.trim() as EventType)
          .filter(t => t);
        if (!parsedTypes.length) {
          parsedTypes = undefined;
        }
      }

      console.log('ℹ️ [FeedController] Fetching feed events with filters:', {
        organizerIds: parsedOrganizerIds,
        categories: parsedCategories,
        types: parsedTypes,
      });

      const events = await this.feedService.getFeedEvents(
        parsedOrganizerIds,
        parsedCategories,
        parsedTypes,
      );

      return {
        message: 'Events fetched successfully',
        data: events,
      };
    } catch (error) {
      console.error('🚨 [FeedController] Error in getFeedEvents:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to fetch events: ' + error.message);
    }
  }

  @Get('filters')
  async getFilterOptions() {
    try {
      console.log('ℹ️ [FeedController] Fetching filter options');
      const options = await this.feedService.getFilterOptions();
      return {
        message: 'Filter options fetched successfully',
        data: options,
      };
    } catch (error) {
      console.error('🚨 [FeedController] Error in getFilterOptions:', error.message);
      throw new Error('Failed to fetch filter options: ' + error.message);
    }
  }
}