import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [EmailModule],
  controllers: [EventController],
  providers: [EventService, PrismaService],
})
export class EventModule {}