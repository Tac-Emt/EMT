import { ConfigService } from '@nestjs/config';
interface MailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendMail(options: MailOptions): Promise<any>;
    sendCollaborationConfirmation(to: string, eventTitle: string, eventDate: string, eventId: number, organizerId: number): Promise<any>;
    sendHostNotification(to: string, eventTitle: string, message: string): Promise<any>;
}
export {};
