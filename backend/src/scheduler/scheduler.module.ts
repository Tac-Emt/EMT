import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SchedulerService, PrismaService, EmailService],
  exports: [SchedulerService],
})
export class SchedulerModule {}