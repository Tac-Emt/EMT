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
};
EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map