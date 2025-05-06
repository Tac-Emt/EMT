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
exports.SpeakerFeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SpeakerFeedbackService = class SpeakerFeedbackService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFeedback(data) {
        return this.prisma.speakerFeedback.create({
            data: {
                rating: data.rating,
                comment: data.comment,
                event: { connect: { id: data.eventId } },
                speaker: { connect: { id: data.speakerId } },
                user: { connect: { id: data.userId } },
            },
            include: {
                event: true,
                speaker: true,
                user: true,
            },
        });
    }
    async getFeedback(id) {
        const feedback = await this.prisma.speakerFeedback.findUnique({
            where: { id },
            include: {
                event: true,
                speaker: true,
                user: true,
            },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        return feedback;
    }
    async getSpeakerFeedbacks(speakerId) {
        return this.prisma.speakerFeedback.findMany({
            where: { speakerId },
            include: {
                event: true,
                user: true,
            },
        });
    }
    async getEventFeedbacks(eventId) {
        return this.prisma.speakerFeedback.findMany({
            where: { eventId },
            include: {
                speaker: true,
                user: true,
            },
        });
    }
    async updateFeedback(id, data) {
        const feedback = await this.prisma.speakerFeedback.findUnique({
            where: { id },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        return this.prisma.speakerFeedback.update({
            where: { id },
            data,
            include: {
                event: true,
                speaker: true,
                user: true,
            },
        });
    }
    async deleteFeedback(id) {
        const feedback = await this.prisma.speakerFeedback.findUnique({
            where: { id },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        await this.prisma.speakerFeedback.delete({
            where: { id },
        });
        return { message: 'Feedback deleted successfully' };
    }
    async getSpeakerStats(speakerId) {
        const feedbacks = await this.prisma.speakerFeedback.findMany({
            where: { speakerId },
        });
        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = feedbacks.length > 0 ? totalRating / feedbacks.length : 0;
        return {
            totalFeedbacks: feedbacks.length,
            averageRating,
            ratingDistribution: this.getRatingDistribution(feedbacks),
        };
    }
    getRatingDistribution(feedbacks) {
        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
        feedbacks.forEach((feedback) => {
            distribution[feedback.rating]++;
        });
        return distribution;
    }
};
SpeakerFeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpeakerFeedbackService);
exports.SpeakerFeedbackService = SpeakerFeedbackService;
//# sourceMappingURL=speaker-feedback.service.js.map