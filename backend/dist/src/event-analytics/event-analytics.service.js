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
exports.EventAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventAnalyticsService = class EventAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEventAnalytics(eventId) {
        return this.prisma.eventAnalytics.create({
            data: {
                event: { connect: { id: eventId } },
                views: 0,
                registrations: 0,
                checkIns: 0,
            },
        });
    }
    async getEventAnalytics(eventId) {
        const analytics = await this.prisma.eventAnalytics.findUnique({
            where: { eventId },
        });
        if (!analytics) {
            throw new common_1.NotFoundException('Analytics not found for this event');
        }
        return analytics;
    }
    async updateEventAnalytics(eventId, data) {
        const analytics = await this.prisma.eventAnalytics.findUnique({
            where: { eventId },
        });
        if (!analytics) {
            throw new common_1.NotFoundException('Analytics not found for this event');
        }
        return this.prisma.eventAnalytics.update({
            where: { eventId },
            data: {
                views: data.views !== undefined ? data.views : undefined,
                registrations: data.registrations !== undefined ? data.registrations : undefined,
                checkIns: data.checkIns !== undefined ? data.checkIns : undefined,
            },
        });
    }
    async incrementEventViews(eventId) {
        const analytics = await this.prisma.eventAnalytics.findUnique({
            where: { eventId },
        });
        if (!analytics) {
            return this.createEventAnalytics(eventId);
        }
        return this.prisma.eventAnalytics.update({
            where: { eventId },
            data: {
                views: { increment: 1 },
            },
        });
    }
    async getEventStats(eventId) {
        const analytics = await this.prisma.eventAnalytics.findUnique({
            where: { eventId },
        });
        if (!analytics) {
            throw new common_1.NotFoundException('Analytics not found for this event');
        }
        const registrations = await this.prisma.registration.count({
            where: { eventId },
        });
        const checkedInCount = await this.prisma.registration.count({
            where: {
                eventId,
                checkedIn: true,
            },
        });
        return Object.assign(Object.assign({}, analytics), { totalRegistrations: registrations, checkInRate: registrations > 0 ? (checkedInCount / registrations) * 100 : 0 });
    }
};
EventAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventAnalyticsService);
exports.EventAnalyticsService = EventAnalyticsService;
//# sourceMappingURL=event-analytics.service.js.map