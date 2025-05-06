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
exports.SpeakerService = exports.SpeakerStatus = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
var SpeakerStatus;
(function (SpeakerStatus) {
    SpeakerStatus["PENDING"] = "PENDING";
    SpeakerStatus["ACCEPTED"] = "ACCEPTED";
    SpeakerStatus["REJECTED"] = "REJECTED";
})(SpeakerStatus = exports.SpeakerStatus || (exports.SpeakerStatus = {}));
let SpeakerService = class SpeakerService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async createSpeaker(data) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                bio: data.bio,
                photo: data.photo,
                organization: data.organization,
                title: data.title,
                socialLinks: data.socialLinks,
                role: 'SPEAKER',
                password: 'temporary-password-' + Math.random().toString(36).substring(2),
            },
        });
    }
    async getSpeakers() {
        return this.prisma.user.findMany({
            where: { role: 'SPEAKER' },
            include: {
                _count: {
                    select: {
                        speakerEvents: {
                            where: {
                                status: SpeakerStatus.ACCEPTED,
                            },
                        },
                    },
                },
            },
        });
    }
    async getSpeaker(id) {
        const speaker = await this.prisma.user.findFirst({
            where: {
                id,
                role: 'SPEAKER'
            },
            include: {
                speakerEvents: {
                    include: {
                        event: true,
                    },
                },
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        return speaker;
    }
    async updateSpeaker(id, data) {
        const speaker = await this.prisma.user.findFirst({
            where: {
                id,
                role: 'SPEAKER'
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        if (speaker.photo && data.photo && speaker.photo !== data.photo) {
        }
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    async deleteSpeaker(id) {
        const speaker = await this.prisma.user.findFirst({
            where: {
                id,
                role: 'SPEAKER'
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        if (speaker.photo) {
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'Speaker deleted successfully' };
    }
    async getSpeakerStats(id) {
        const speaker = await this.prisma.user.findFirst({
            where: {
                id,
                role: 'SPEAKER'
            },
            include: {
                _count: {
                    select: {
                        speakerEvents: {
                            where: {
                                status: SpeakerStatus.ACCEPTED,
                            },
                        },
                    },
                },
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        return {
            totalEvents: speaker._count.speakerEvents,
        };
    }
    async getSpeakerEvents(speakerId) {
        const events = await this.prisma.eventSpeaker.findMany({
            where: { speakerId },
            include: {
                event: {
                    include: {
                        organizers: {
                            include: {
                                organizer: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { event: { date: 'asc' } },
        });
        return events;
    }
    async getPendingRequests(speakerId) {
        return this.prisma.eventSpeaker.findMany({
            where: {
                speakerId,
                status: SpeakerStatus.PENDING,
            },
            include: {
                event: {
                    include: {
                        organizers: {
                            include: {
                                organizer: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async respondToRequest(eventId, speakerId, accept) {
        var _a;
        const eventSpeaker = await this.prisma.eventSpeaker.findUnique({
            where: {
                eventId_speakerId: {
                    eventId,
                    speakerId,
                },
            },
            include: {
                event: {
                    include: {
                        organizers: {
                            include: {
                                organizer: true,
                            },
                        },
                    },
                },
            },
        });
        if (!eventSpeaker) {
            throw new common_1.NotFoundException('Speaker request not found');
        }
        if (eventSpeaker.status !== SpeakerStatus.PENDING) {
            throw new common_1.BadRequestException('This request has already been processed');
        }
        const status = accept ? SpeakerStatus.ACCEPTED : SpeakerStatus.REJECTED;
        const updatedEventSpeaker = await this.prisma.eventSpeaker.update({
            where: {
                eventId_speakerId: {
                    eventId,
                    speakerId,
                },
            },
            data: { status },
            include: {
                event: true,
            },
        });
        const host = (_a = eventSpeaker.event.organizers.find(o => o.isHost)) === null || _a === void 0 ? void 0 : _a.organizer;
        if (host) {
            await this.emailService.sendMail({
                to: host.email,
                subject: `Speaker ${accept ? 'Accepted' : 'Rejected'} Request`,
                text: `The speaker has ${accept ? 'accepted' : 'rejected'} the request to speak at "${eventSpeaker.event.title}".`,
            });
        }
        return updatedEventSpeaker;
    }
    async getSpeakerProfile(speakerId) {
        const speaker = await this.prisma.user.findFirst({
            where: {
                id: speakerId,
                role: 'SPEAKER'
            },
            include: {
                _count: {
                    select: {
                        speakerEvents: {
                            where: {
                                status: SpeakerStatus.ACCEPTED,
                            },
                        },
                    },
                },
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        return {
            id: speaker.id,
            name: speaker.name,
            email: speaker.email,
            totalEvents: speaker._count.speakerEvents,
        };
    }
};
SpeakerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], SpeakerService);
exports.SpeakerService = SpeakerService;
//# sourceMappingURL=speaker.service.js.map