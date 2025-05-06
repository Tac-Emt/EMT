import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
export declare class SchedulerService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    handleExpiredConfirmations(): Promise<void>;
}
