import { Module } from '@nestjs/common';
import { EventSeriesController } from './event-series.controller';
import { EventSeriesService } from './event-series.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EventSeriesController],
  providers: [EventSeriesService, PrismaService],
  exports: [EventSeriesService],
})
export class EventSeriesModule {} 