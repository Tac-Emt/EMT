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
import { RegistrationModule } from './registration/registration.module';
import { SpeakerModule } from './speaker/speaker.module';

import { EventTaskModule } from './event-task/event-task.module';
import { CheckInModule } from './check-in/check-in.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'Uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AdminModule,
    UserModule,
    AuthModule,
    FeedModule,
    SchedulerModule,
    EmailModule,
    EventModule,
    RegistrationModule,
    SpeakerModule,
    EventTaskModule,
    CheckInModule,
    FileUploadModule,
  ],
})
export class AppModule {}