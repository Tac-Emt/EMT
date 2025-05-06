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
exports.RegistrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let RegistrationService = class RegistrationService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async createRegistration(data) {
        return this.prisma.registration.create({
            data: {
                status: data.status,
                user: { connect: { id: data.userId } },
                event: { connect: { id: data.eventId } },
                type: { connect: { id: data.registrationTypeId } },
            },
            include: {
                user: true,
                event: true,
                type: true,
            },
        });
    }
    async getRegistrations(filters) {
        return this.prisma.registration.findMany({
            where: Object.assign(Object.assign(Object.assign({}, (filters.userId && { userId: filters.userId })), (filters.eventId && { eventId: filters.eventId })), (filters.status && { status: filters.status })),
            include: {
                user: true,
                event: true,
                type: true,
            },
        });
    }
    async getRegistration(id) {
        const registration = await this.prisma.registration.findUnique({
            where: { id },
            include: {
                user: true,
                event: true,
                type: true,
            },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        return registration;
    }
    async updateRegistration(id, data) {
        const registration = await this.prisma.registration.findUnique({
            where: { id },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        return this.prisma.registration.update({
            where: { id },
            data: Object.assign(Object.assign({}, (data.status && { status: data.status })), (data.registrationTypeId && {
                type: { connect: { id: data.registrationTypeId } },
            })),
            include: {
                user: true,
                event: true,
                type: true,
            },
        });
    }
    async deleteRegistration(id) {
        const registration = await this.prisma.registration.findUnique({
            where: { id },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        await this.prisma.registration.delete({
            where: { id },
        });
        return { message: 'Registration deleted successfully' };
    }
    async getEventRegistrationStats(eventId) {
        const registrations = await this.prisma.registration.findMany({
            where: { eventId },
            include: {
                type: true,
            },
        });
        const stats = {
            total: registrations.length,
            byStatus: {},
            byType: {},
        };
        registrations.forEach((registration) => {
            stats.byStatus[registration.status] = (stats.byStatus[registration.status] || 0) + 1;
            const typeName = registration.type.name;
            stats.byType[typeName] = (stats.byType[typeName] || 0) + 1;
        });
        return stats;
    }
};
RegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], RegistrationService);
exports.RegistrationService = RegistrationService;
//# sourceMappingURL=registration.service.js.map