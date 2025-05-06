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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let CheckInService = class CheckInService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async generateCheckInCode(eventId) {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        return this.prisma.checkInCode.create({
            data: {
                code,
                event: { connect: { id: eventId } },
            },
        });
    }
    async validateCheckInCode(code) {
        const checkInCode = await this.prisma.checkInCode.findFirst({
            where: {
                code,
                used: false,
            },
            include: {
                event: true,
            },
        });
        if (!checkInCode) {
            throw new common_1.NotFoundException('Invalid or expired check-in code');
        }
        return checkInCode;
    }
    async checkInUser(data) {
        const checkInCode = await this.validateCheckInCode(data.code);
        if (checkInCode.eventId !== data.eventId) {
            throw new common_1.BadRequestException('Check-in code is not valid for this event');
        }
        const registration = await this.prisma.registration.findFirst({
            where: {
                eventId: data.eventId,
                userId: data.userId,
            },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        if (registration.checkedIn) {
            throw new common_1.BadRequestException('User is already checked in');
        }
        const updatedRegistration = await this.prisma.registration.update({
            where: { id: registration.id },
            data: {
                checkedIn: true,
                checkedInAt: new Date(),
                checkInCode: {
                    connect: { id: checkInCode.id },
                },
            },
            include: {
                user: true,
                event: true,
            },
        });
        await this.prisma.checkInCode.update({
            where: { id: checkInCode.id },
            data: {
                used: true,
                usedAt: new Date(),
            },
        });
        return updatedRegistration;
    }
    async getEventCheckIns(eventId) {
        return this.prisma.registration.findMany({
            where: {
                eventId,
                checkedIn: true,
            },
            include: {
                user: true,
            },
        });
    }
    async getUserCheckIns(userId) {
        return this.prisma.registration.findMany({
            where: {
                userId,
                checkedIn: true,
            },
            include: {
                event: true,
            },
        });
    }
    async getEventCheckInStats(eventId) {
        const totalRegistrations = await this.prisma.registration.count({
            where: { eventId },
        });
        const checkedInCount = await this.prisma.registration.count({
            where: {
                eventId,
                checkedIn: true,
            },
        });
        return {
            totalRegistrations,
            checkedInCount,
            checkInRate: totalRegistrations > 0 ? (checkedInCount / totalRegistrations) * 100 : 0,
        };
    }
};
CheckInService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], CheckInService);
exports.CheckInService = CheckInService;
//# sourceMappingURL=check-in.service.js.map