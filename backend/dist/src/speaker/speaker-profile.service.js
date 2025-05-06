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
exports.SpeakerProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SpeakerProfileService = class SpeakerProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProfile(data) {
        try {
            return await this.prisma.speakerProfile.create({
                data,
                include: {
                    user: true,
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create speaker profile: ' + error.message);
        }
    }
    async getProfile(id) {
        const speaker = await this.prisma.user.findFirst({
            where: {
                id,
                role: 'SPEAKER'
            },
            include: {
                speakerProfile: true,
                _count: {
                    select: {
                        speakerEvents: {
                            where: {
                                status: 'ACCEPTED',
                            },
                        },
                    },
                },
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        return Object.assign(Object.assign({}, speaker), { totalEvents: speaker._count.speakerEvents });
    }
    async getUserProfile(userId) {
        const profile = await this.prisma.speakerProfile.findFirst({
            where: { userId },
            include: {
                user: true,
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Speaker profile not found');
        }
        return profile;
    }
    async updateProfile(id, data) {
        const speaker = await this.prisma.user.findFirst({
            where: {
                id,
                role: 'SPEAKER'
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                bio: data.bio,
                photo: data.photo,
                organization: data.organization,
                title: data.title,
                socialLinks: data.socialLinks,
            },
            include: {
                speakerProfile: true,
            },
        });
        return updatedUser;
    }
    async deleteProfile(id) {
        try {
            await this.prisma.speakerProfile.delete({
                where: { id },
            });
            return { message: 'Speaker profile deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Speaker profile not found');
            }
            throw new common_1.BadRequestException('Failed to delete speaker profile: ' + error.message);
        }
    }
    async getSpeakerEvents(userId) {
        const profile = await this.getUserProfile(userId);
        return this.prisma.eventSpeaker.findMany({
            where: { speakerId: userId },
            include: {
                event: true,
            },
        });
    }
    async getSpeakerStats(userId) {
        const [profile, events, feedback] = await Promise.all([
            this.getUserProfile(userId),
            this.prisma.eventSpeaker.findMany({
                where: { speakerId: userId },
                include: { event: true },
            }),
            this.prisma.speakerFeedback.findMany({
                where: { speakerId: userId },
            }),
        ]);
        const stats = {
            totalEvents: events.length,
            upcomingEvents: events.filter((e) => e.event.date > new Date()).length,
            pastEvents: events.filter((e) => e.event.date <= new Date()).length,
            averageRating: feedback.length > 0
                ? feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length
                : 0,
            totalFeedback: feedback.length,
        };
        return stats;
    }
};
SpeakerProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpeakerProfileService);
exports.SpeakerProfileService = SpeakerProfileService;
//# sourceMappingURL=speaker-profile.service.js.map