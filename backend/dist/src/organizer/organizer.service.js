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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const client_1 = require(".prisma/client");
const fs = require("fs/promises");
const path = require("path");
let EventService = class EventService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async createEvent(organizerId, data) {
        try {
            console.log('ℹ️ [OrganizerService] Creating event:', { organizerId, data });
            const eventDate = new Date(data.date);
            if (isNaN(eventDate.getTime())) {
                throw new common_1.BadRequestException('Invalid date format');
            }
            if (data.registrationLink && !data.registrationLink.startsWith('http')) {
                throw new common_1.BadRequestException('Registration link must start with http');
            }
            const slug = this.generateSlug(data.title);
            const event = await this.prisma.event.create({
                data: {
                    title: data.title,
                    description: data.description,
                    date: eventDate,
                    location: data.location,
                    image: data.image,
                    category: data.category,
                    type: data.type,
                    eventTag: data.eventTag,
                    registrationLink: data.registrationLink,
                    slug,
                    capacity: 0,
                    pageContent: data.pageContent,
                    pageSettings: data.pageSettings,
                    organizers: {
                        create: {
                            organizerId,
                            isHost: true,
                        },
                    },
                    speakers: data.speakerRequests ? {
                        create: data.speakerRequests.map(request => ({
                            speakerId: request.speakerId,
                            topic: request.topic,
                            description: request.description,
                            status: 'PENDING',
                        })),
                    } : undefined,
                },
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
                    speakers: {
                        include: {
                            speaker: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (data.speakerRequests) {
                for (const request of data.speakerRequests) {
                    const speaker = await this.prisma.user.findUnique({
                        where: { id: request.speakerId },
                    });
                    if (speaker) {
                        await this.emailService.sendMail({
                            to: speaker.email,
                            subject: `Speaker Request: ${data.title}`,
                            text: `You have been invited to speak at "${data.title}". Topic: ${request.topic || 'Not specified'}. Description: ${request.description || 'Not provided'}.`,
                        });
                    }
                }
            }
            return event;
        }
        catch (error) {
            console.error('🚨 [OrganizerService] Error creating event:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to create event: ' + error.message);
        }
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Math.random().toString(36).substring(2, 8);
    }
    async confirmEventParticipation(eventId, organizerId, confirm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: { include: { organizer: { select: { id: true, email: true, name: true } } } } },
        });
        if (!event || event.status !== client_1.EventStatus.DRAFT) {
            throw new common_1.NotFoundException('Event not found or not in DRAFT status');
        }
        const organizerEntry = event.organizers.find(o => o.organizerId === organizerId);
        if (!organizerEntry || !organizerEntry.pendingConfirmation) {
            throw new common_1.BadRequestException('Organizer not pending confirmation for this event');
        }
        if (!confirm) {
            if (event.image) {
                const otherEvents = await this.prisma.event.findMany({
                    where: { image: event.image, id: { not: eventId } },
                });
                if (otherEvents.length === 0) {
                    const filePath = path.join(process.cwd(), event.image);
                    try {
                        await fs.unlink(filePath);
                        console.log(`ℹ️ [EventService] Deleted image file: ${filePath}`);
                    }
                    catch (err) {
                        console.error(`🚨 [EventService] Error deleting image file: ${filePath}`, err.message);
                    }
                }
            }
            await this.prisma.event.delete({ where: { id: eventId } });
            const host = event.organizers.find(o => o.isHost).organizer;
            await this.emailService.sendHostNotification(host.email, event.title, `The event "${event.title}" was deleted because a collaborator declined.`);
            return { message: 'Event declined and deleted' };
        }
        await this.prisma.eventOrganizer.update({
            where: { eventId_organizerId: { eventId, organizerId } },
            data: { pendingConfirmation: false, expiresAt: null },
        });
        const updatedEvent = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: {
                    include: { organizer: { select: { id: true, email: true, name: true } } },
                },
            },
        });
        const allConfirmed = updatedEvent.organizers.every(o => !o.pendingConfirmation);
        if (allConfirmed) {
            await this.prisma.event.update({
                where: { id: eventId },
                data: { status: client_1.EventStatus.PUBLISHED },
            });
            const host = updatedEvent.organizers.find(o => o.isHost).organizer;
            await this.emailService.sendHostNotification(host.email, event.title, `The event "${event.title}" is now PUBLISHED with all organizers confirmed.`);
        }
        return { message: 'Participation confirmed' };
    }
    async getOrganizerEvents(organizerId, page, limit) {
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where: {
                    organizers: { some: { organizerId } },
                },
                include: {
                    organizers: {
                        include: { organizer: { select: { id: true, name: true } } },
                    },
                },
                orderBy: { date: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.event.count({
                where: {
                    organizers: { some: { organizerId } },
                },
            }),
        ]);
        const statusBreakdown = await this.prisma.event.groupBy({
            by: ['status'],
            where: { organizers: { some: { organizerId } } },
            _count: { status: true },
        });
        const categoryBreakdown = await this.prisma.event.groupBy({
            by: ['category'],
            where: { organizers: { some: { organizerId } } },
            _count: { category: true },
        });
        const typeBreakdown = await this.prisma.event.groupBy({
            by: ['type'],
            where: { organizers: { some: { organizerId } } },
            _count: { type: true },
        });
        const upcomingEvents = await this.prisma.event.count({
            where: {
                organizers: { some: { organizerId } },
                status: client_1.EventStatus.PUBLISHED,
                date: { gt: new Date() },
            },
        });
        return {
            events,
            total,
            statusBreakdown: statusBreakdown.map(item => [item.status, item._count.status]),
            categoryBreakdown: categoryBreakdown.map(item => [item.category, item._count.category]),
            typeBreakdown: typeBreakdown.map(item => [item.type, item._count.type]),
            upcomingEvents,
        };
    }
    async getEventById(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                organizers: {
                    include: { organizer: { select: { id: true, name: true } } },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async updateEvent(eventId, organizerId, data) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: {
                    include: { organizer: true },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const isHost = event.organizers.some((o) => o.organizerId === organizerId && o.isHost);
        if (!isHost) {
            throw new common_1.ForbiddenException('Only the host can update the event');
        }
        if (event.status === client_1.EventStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update a cancelled event');
        }
        if (data.date) {
            const eventDate = new Date(data.date);
            if (isNaN(eventDate.getTime())) {
                throw new common_1.BadRequestException('Invalid date format');
            }
        }
        if (data.registrationLink && !data.registrationLink.startsWith('http')) {
            throw new common_1.BadRequestException('Invalid registration link. Must be a valid URL starting with http');
        }
        if (data.image && !data.image.startsWith('/uploads/')) {
            throw new common_1.BadRequestException('Invalid image URL. Must start with /uploads/');
        }
        if (data.pageContent && typeof data.pageContent !== 'object') {
            throw new common_1.BadRequestException('Page content must be a valid JSON object');
        }
        if (data.pageSettings && typeof data.pageSettings !== 'object') {
            throw new common_1.BadRequestException('Page settings must be a valid JSON object');
        }
        const updateData = Object.assign({}, data);
        if (data.date) {
            updateData.date = new Date(data.date);
        }
        if (data.category && data.type) {
            updateData.eventTag = `${data.category}-${data.type}`;
        }
        const updatedEvent = await this.prisma.event.update({
            where: { id: eventId },
            data: updateData,
            include: {
                organizers: {
                    include: { organizer: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        return updatedEvent;
    }
    async deleteEvent(id, organizerId) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { organizers: { select: { organizerId: true, isHost: true } } },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (!event.organizers.some(o => o.organizerId === organizerId && o.isHost)) {
            throw new common_1.ForbiddenException('Only the host organizer can delete this event');
        }
        if (event.image) {
            const otherEvents = await this.prisma.event.findMany({
                where: { image: event.image, id: { not: id } },
            });
            if (otherEvents.length === 0) {
                const filePath = path.join(process.cwd(), event.image);
                try {
                    await fs.unlink(filePath);
                    console.log(`ℹ️ [EventService] Deleted image file: ${filePath}`);
                }
                catch (err) {
                    console.error(`🚨 [EventService] Error deleting image file: ${filePath}`, err.message);
                }
            }
        }
        await this.prisma.event.delete({ where: { id } });
        return { message: 'Event deleted successfully' };
    }
};
EventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], EventService);
exports.EventService = EventService;
//# sourceMappingURL=organizer.service.js.map