import { Module } from '@nestjs/common';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';
import { SpeakerFeedbackController } from './speaker-feedback.controller';
import { SpeakerFeedbackService } from './speaker-feedback.service';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [EmailModule],
  controllers: [SpeakerController, SpeakerFeedbackController],
  providers: [SpeakerService, SpeakerFeedbackService, PrismaService],
  exports: [SpeakerService, SpeakerFeedbackService],
})
export class SpeakerModule {} 