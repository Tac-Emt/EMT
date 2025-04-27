import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron('0 0 * * *')
  async handleExpiredConfirmations() {
    this.logger.log('Checking for expired event confirmations');
    const now = new Date();
    const expiredEntries = await this.prisma.eventOrganizer.findMany({
      where: { pendingConfirmation: true, expiresAt: { lte: now } },
      include: { event: { include: { organizers: { include: { organizer: true } } } } },
    });

    for (const entry of expiredEntries) {
      const event = entry.event;
      await this.prisma.event.delete({ where: { id: event.id } });
      const host = event.organizers.find(o => o.isHost).organizer;
      await this.emailService.sendMail({
        to: host.email,
        subject: `Event "${event.title}" Expired`,
        text: `The event "${event.title}" was deleted due to expired confirmation.`,
      });
      this.logger.log(`Deleted event ${event.id} due to expired confirmation`);
    }
  }
}