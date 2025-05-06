import { ConfigService } from '@nestjs/config';
interface Event {
    id: number;
    title: string;
    date: Date;
    location: string;
}
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
    private sendEmail;
    sendMail(options: MailOptions): Promise<any>;
    sendCollaborationConfirmation(to: string, eventTitle: string, eventDate: string, eventId: number, organizerId: number): Promise<any>;
    sendHostNotification(to: string, eventTitle: string, message: string): Promise<any>;
    sendRegistrationConfirmation(email: string, event: Event): Promise<void>;
    sendTaskAssignment(email: string, taskTitle: string, eventTitle: string): Promise<void>;
    sendCheckInConfirmation(email: string, event: Event): Promise<void>;
    sendPasswordReset(email: string, resetToken: string): Promise<void>;
    sendEventUpdate(email: string, event: Event, updateDetails: string): Promise<void>;
    sendWaitlistNotification(email: string, event: Event): Promise<void>;
    sendWaitlistSpotAvailable(email: string, event: Event): Promise<void>;
}
export {};
