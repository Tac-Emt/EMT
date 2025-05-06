import { Module } from '@nestjs/common';
import { SpeakerFeedbackController } from './speaker-feedback.controller';
import { SpeakerFeedbackService } from './speaker-feedback.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SpeakerFeedbackController],
  providers: [SpeakerFeedbackService, PrismaService],
  exports: [SpeakerFeedbackService],
})
export class SpeakerFeedbackModule {} 