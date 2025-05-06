import { Module } from '@nestjs/common';
import { EventController } from './organizer.controller';
import { EventService } from './organizer.service';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [EmailModule],
  controllers: [EventController],
  providers: [EventService, PrismaService],
})
export class EventModule {}