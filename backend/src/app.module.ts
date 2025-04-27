import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FeedModule } from './feed/feed.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EmailModule } from './email/email.module';
import { EventModule } from './event/event.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'Uploads'),
      serveRoot: '/uploads',
    }),
    AdminModule,
    UserModule,
    AuthModule,
    FeedModule,
    SchedulerModule,
    EmailModule,
    EventModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}