import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get('EMAIL_PORT') || '587', 10),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
      tls: { rejectUnauthorized: true },
    });
  }

  async sendMail(options: MailOptions) {
    try {
      const from = this.configService.get('EMAIL_FROM') || '"TAC-EMT Events" <no-reply@tac-emt.org>';
      const info = await this.transporter.sendMail({ from, ...options });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendCollaborationConfirmation(to: string, eventTitle: string, eventDate: string, eventId: number, organizerId: number) {
    const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    const confirmUrl = `${baseUrl}/organizer/events/${eventId}/confirm?organizerId=${organizerId}`;
    const subject = `Confirm Participation: ${eventTitle}`;
    const text = `You’ve been selected as a collaborator for "${eventTitle}" on ${eventDate}. Please confirm within 7 days by visiting: ${confirmUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">TAC-EMT Event Collaboration</h2>
        <p>Hello,</p>
        <p>You’ve been selected as a collaborator for <strong>"${eventTitle}"</strong> scheduled on ${eventDate}.</p>
        <p>Please confirm your participation within 7 days by clicking below:</p>
        <a href="${confirmUrl}" style="display: inline-block; padding: 10px 20px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 4px;">Confirm Participation</a>
        <p>If you cannot participate, please contact the event host.</p>
        <p>Best regards,<br>TAC-EMT Team</p>
      </div>
    `;
    return this.sendMail({ to, subject, text, html });
  }

  async sendHostNotification(to: string, eventTitle: string, message: string) {
    const subject = `Update: ${eventTitle}`;
    const text = message;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">TAC-EMT Event Update</h2>
        <p>Hello,</p>
        <p>${message}</p>
        <p>Best regards,<br>TAC-EMT Team</p>
      </div>
    `;
    return this.sendMail({ to, subject, text, html });
  }
}