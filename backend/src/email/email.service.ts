import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Event } from '.prisma/client';

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
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
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
    const text = `You've been selected as a collaborator for "${eventTitle}" on ${eventDate}. Please confirm within 7 days by visiting: ${confirmUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">TAC-EMT Event Collaboration</h2>
        <p>Hello,</p>
        <p>You've been selected as a collaborator for <strong>"${eventTitle}"</strong> scheduled on ${eventDate}.</p>
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

  // Event Registration Confirmation
  async sendRegistrationConfirmation(email: string, event: Event) {
    const subject = `Registration Confirmation - ${event.title}`;
    const html = `
      <h1>Registration Confirmed!</h1>
      <p>Thank you for registering for ${event.title}.</p>
      <p>Event Details:</p>
      <ul>
        <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
        <li>Location: ${event.location}</li>
      </ul>
      <p>We look forward to seeing you there!</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Task Assignment Notification
  async sendTaskAssignment(email: string, taskTitle: string, eventTitle: string) {
    const subject = `New Task Assignment - ${eventTitle}`;
    const html = `
      <h1>New Task Assigned</h1>
      <p>You have been assigned a new task for ${eventTitle}:</p>
      <p><strong>${taskTitle}</strong></p>
      <p>Please check your dashboard for more details.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Check-in Confirmation
  async sendCheckInConfirmation(email: string, event: Event) {
    const subject = `Check-in Confirmed - ${event.title}`;
    const html = `
      <h1>Check-in Successful!</h1>
      <p>You have been successfully checked in to ${event.title}.</p>
      <p>Enjoy the event!</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Password Reset
  async sendPasswordReset(email: string, resetToken: string) {
    const subject = 'Password Reset Request';
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Event Update Notification
  async sendEventUpdate(email: string, event: Event, updateDetails: string) {
    const subject = `Event Update - ${event.title}`;
    const html = `
      <h1>Event Update</h1>
      <p>There has been an update to ${event.title}:</p>
      <p>${updateDetails}</p>
      <p>Please check the event page for more details.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Waitlist Notification
  async sendWaitlistNotification(email: string, event: Event) {
    const subject = `Waitlist Update - ${event.title}`;
    const html = `
      <h1>Waitlist Update</h1>
      <p>You have been added to the waitlist for ${event.title}.</p>
      <p>We will notify you if a spot becomes available.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Waitlist Spot Available
  async sendWaitlistSpotAvailable(email: string, event: Event) {
    const subject = `Spot Available - ${event.title}`;
    const html = `
      <h1>Spot Available!</h1>
      <p>A spot has become available for ${event.title}.</p>
      <p>Please click the link below to confirm your registration:</p>
      <a href="${this.configService.get('FRONTEND_URL')}/events/${event.id}/register">Confirm Registration</a>
      <p>This spot will be held for 24 hours.</p>
    `;
    await this.sendEmail(email, subject, html);
  }
}