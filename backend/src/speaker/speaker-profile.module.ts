import { Module } from '@nestjs/common';
import { SpeakerProfileController } from './speaker-profile.controller';
import { SpeakerProfileService } from './speaker-profile.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SpeakerProfileController],
  providers: [SpeakerProfileService, PrismaService],
  exports: [SpeakerProfileService],
})
export class SpeakerProfileModule {} 