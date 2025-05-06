import { Module } from '@nestjs/common';
import { RegistrationTypeController } from './registration-type.controller';
import { RegistrationTypeService } from './registration-type.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RegistrationTypeController],
  providers: [RegistrationTypeService, PrismaService],
  exports: [RegistrationTypeService],
})
export class RegistrationTypeModule {} 