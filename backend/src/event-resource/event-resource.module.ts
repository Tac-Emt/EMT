import { Module } from '@nestjs/common';
import { EventResourceController } from './event-resource.controller';
import { EventResourceService } from './event-resource.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EventResourceController],
  providers: [EventResourceService, PrismaService],
  exports: [EventResourceService],
})
export class EventResourceModule {} 