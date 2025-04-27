import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [UserModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}