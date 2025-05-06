import { Module } from '@nestjs/common';
import { EventAnalyticsController } from './event-analytics.controller';
import { EventAnalyticsService } from './event-analytics.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EventAnalyticsController],
  providers: [EventAnalyticsService, PrismaService],
  exports: [EventAnalyticsService],
})
export class EventAnalyticsModule {} 