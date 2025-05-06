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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(SchedulerService_1.name);
    }
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
};
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleExpiredConfirmations", null);
SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], SchedulerService);
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=scheduler.service.js.map