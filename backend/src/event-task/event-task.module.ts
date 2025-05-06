import { Module } from '@nestjs/common';
import { EventTaskController } from './event-task.controller';
import { EventTaskService } from './event-task.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EventTaskController],
  providers: [EventTaskService, PrismaService],
  exports: [EventTaskService],
})
export class EventTaskModule {} 