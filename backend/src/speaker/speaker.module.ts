import { Module } from '@nestjs/common';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [SpeakerController],
  providers: [SpeakerService, PrismaService, EmailService],
  exports: [SpeakerService],
})
export class SpeakerModule {} 