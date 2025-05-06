"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const config_1 = require("@nestjs/config");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
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
    async sendEmail(to, subject, html) {
        try {
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM'),
                to,
                subject,
                html,
            });
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw new Error('Failed to send email');
        }
    }
    async sendMail(options) {
        try {
            const from = this.configService.get('EMAIL_FROM') || '"TAC-EMT Events" <no-reply@tac-emt.org>';
            const info = await this.transporter.sendMail(Object.assign({ from }, options));
            this.logger.log(`Email sent: ${info.messageId}`);
            return info;
        }
        catch (error) {
            this.logger.error(`Error sending email: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to send email');
        }
    }
    async sendCollaborationConfirmation(to, eventTitle, eventDate, eventId, organizerId) {
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
    async sendHostNotification(to, eventTitle, message) {
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
    async sendRegistrationConfirmation(email, event) {
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
    async sendTaskAssignment(email, taskTitle, eventTitle) {
        const subject = `New Task Assignment - ${eventTitle}`;
        const html = `
      <h1>New Task Assigned</h1>
      <p>You have been assigned a new task for ${eventTitle}:</p>
      <p><strong>${taskTitle}</strong></p>
      <p>Please check your dashboard for more details.</p>
    `;
        await this.sendEmail(email, subject, html);
    }
    async sendCheckInConfirmation(email, event) {
        const subject = `Check-in Confirmed - ${event.title}`;
        const html = `
      <h1>Check-in Successful!</h1>
      <p>You have been successfully checked in to ${event.title}.</p>
      <p>Enjoy the event!</p>
    `;
        await this.sendEmail(email, subject, html);
    }
    async sendPasswordReset(email, resetToken) {
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
    async sendEventUpdate(email, event, updateDetails) {
        const subject = `Event Update - ${event.title}`;
        const html = `
      <h1>Event Update</h1>
      <p>There has been an update to ${event.title}:</p>
      <p>${updateDetails}</p>
      <p>Please check the event page for more details.</p>
    `;
        await this.sendEmail(email, subject, html);
    }
    async sendWaitlistNotification(email, event) {
        const subject = `Waitlist Update - ${event.title}`;
        const html = `
      <h1>Waitlist Update</h1>
      <p>You have been added to the waitlist for ${event.title}.</p>
      <p>We will notify you if a spot becomes available.</p>
    `;
        await this.sendEmail(email, subject, html);
    }
    async sendWaitlistSpotAvailable(email, event) {
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
};
EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map