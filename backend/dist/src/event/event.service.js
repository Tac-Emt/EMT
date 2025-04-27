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
const prisma_service_1 = require("../prisma.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
const fs = require("fs/promises");
const path = require("path");
let EventService = class EventService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async createEvent(title, description, date, organizerId, category, type, status = client_1.EventStatus.DRAFT, location, image, collaboratorIds) {
        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        const organizer = await this.prisma.user.findUnique({
            where: { id: organizerId },
        });
        if (!organizer || organizer.role !== 'ORGANIZER') {
            throw new common_1.BadRequestException('User must have ORGANIZER role');
        }
        if (image && !image.startsWith('/uploads/')) {
            throw new common_1.BadRequestException('Invalid image URL. Must start with /uploads/');
        }
        const collaboratorData = [];
        if (collaboratorIds && collaboratorIds.length > 0) {
            if (collaboratorIds.length > 2) {
                throw new common_1.BadRequestException('Maximum 2 collaborators allowed');
            }
            if (collaboratorIds.includes(organizerId)) {
                throw new common_1.BadRequestException('Host cannot be a collaborator');
            }
            const collaborators = await this.prisma.user.findMany({
                where: { id: { in: collaboratorIds }, role: 'ORGANIZER' },
            });
            if (collaborators.length !== collaboratorIds.length) {
                const invalidIds = collaboratorIds.filter(id => !collaborators.some(c => c.id === id));
                throw new common_1.BadRequestException(`Invalid collaborator IDs: ${invalidIds.join(', ')}`);
            }
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            for (const id of collaboratorIds) {
                collaboratorData.push({
                    organizer: { connect: { id } },
                    isHost: false,
                    pendingConfirmation: true,
                    expiresAt,
                });
            }
        }
        const eventTag = `${category}-${type}`;
        const event = await this.prisma.event.create({
            data: {
                title,
                description,
                date: eventDate,
                status,
                location,
                image,
                category,
                type,
                eventTag,
                organizers: {
                    create: [
                        {
                            organizer: { connect: { id: organizerId } },
                            isHost: true,
                            pendingConfirmation: false,
                        },
                        ...collaboratorData,
                    ],
                },
            },
            include: {
                organizers: {
                    include: { organizer: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        if (collaboratorIds) {
            for (const collaborator of event.organizers.filter(o => !o.isHost)) {
                await this.emailService.sendCollaborationConfirmation(collaborator.organizer.email, event.title, event.date.toISOString(), event.id, collaborator.organizerId);
            }
        }
        return event;
    }
    async confirmEventParticipation(eventId, organizerId, confirm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: { include: { organizer: { select: { id: true, email: true, name: true } } } } },
        });
        if (!event || event.status !== 'DRAFT') {
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
    async updateEvent(id, organizerId, data) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { organizers: { select: { organizerId: true, isHost: true } } },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (!event.organizers.some(o => o.organizerId === organizerId && o.isHost)) {
            throw new common_1.ForbiddenException('Only the host organizer can update this event');
        }
        if (event.status !== client_1.EventStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT events can be updated');
        }
        if (data.image && !data.image.startsWith('/uploads/')) {
            throw new common_1.BadRequestException('Invalid image URL. Must start with /uploads/');
        }
        if (data.image && event.image && data.image !== event.image) {
            const otherEvents = await this.prisma.event.findMany({
                where: { image: event.image, id: { not: id } },
            });
            if (otherEvents.length === 0) {
                const filePath = path.join(process.cwd(), event.image);
                try {
                    await fs.unlink(filePath);
                    console.log(`ℹ️ [EventService] Deleted old image file: ${filePath}`);
                }
                catch (err) {
                    console.error(`🚨 [EventService] Error deleting old image file: ${filePath}`, err.message);
                }
            }
        }
        const updateData = {
            title: data.title,
            description: data.description,
            date: data.date ? new Date(data.date) : undefined,
            status: data.status,
            location: data.location,
            image: data.image,
            category: data.category,
            type: data.type,
            eventTag: data.category && data.type ? `${data.category}-${data.type}` : undefined,
        };
        return this.prisma.event.update({
            where: { id },
            data: updateData,
            include: {
                organizers: {
                    include: { organizer: { select: { id: true, name: true } } },
                },
            },
        });
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
//# sourceMappingURL=event.service.js.map