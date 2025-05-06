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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const user_service_1 = require("../user/user.service");
const email_service_1 = require("../email/email.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const path = require("path");
let AdminService = class AdminService {
    constructor(prisma, userService, emailService) {
        this.prisma = prisma;
        this.userService = userService;
        this.emailService = emailService;
    }
    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async createUser(email, password, name, role) {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (!email || !password || !name || !role) {
            throw new common_1.BadRequestException('Email, password, name, and role are required');
        }
        if (!Object.values(roles_decorator_1.Role).includes(role)) {
            throw new common_1.BadRequestException(`Invalid role value: ${role}. Must be one of ${Object.values(roles_decorator_1.Role).join(', ')}`);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.user.create({
            data: { email, password: hashedPassword, name, role },
            select: { id: true, email: true, name: true, role: true, isEmailVerified: true, createdAt: true, updatedAt: true },
        });
    }
    async updateUser(id, data) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (data.email) {
            const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('Email is already in use by another user');
            }
        }
        if (data.role && !Object.values(roles_decorator_1.Role).includes(data.role)) {
            throw new common_1.BadRequestException(`Invalid role value: ${data.role}. Must be one of ${Object.values(roles_decorator_1.Role).join(', ')}`);
        }
        return this.prisma.user.update({
            where: { id },
            data: { email: data.email, name: data.name, role: data.role },
            select: { id: true, email: true, name: true, role: true, isEmailVerified: true, createdAt: true, updatedAt: true },
        });
    }
    async deleteUser(id) {
        return this.userService.deleteUser(id);
    }
    async getAllEvents() {
        const currentDate = new Date();
        const events = await this.prisma.event.findMany({
            include: { organizers: { include: { organizer: { select: { id: true, name: true } } } } },
            orderBy: { date: 'asc' },
        });
        for (const event of events) {
            const eventDate = new Date(event.date);
            if (eventDate < currentDate && event.status !== client_1.EventStatus.DRAFT) {
                await this.prisma.event.update({
                    where: { id: event.id },
                    data: { status: client_1.EventStatus.DRAFT },
                });
                event.status = client_1.EventStatus.DRAFT;
            }
        }
        return events;
    }
    async createEvent(data) {
        try {
            console.log('ℹ️ [AdminService] Creating event:', { data });
            const eventDate = new Date(data.date);
            if (isNaN(eventDate.getTime())) {
                throw new common_1.BadRequestException('Invalid date format');
            }
            if (data.registrationLink && !data.registrationLink.startsWith('http')) {
                throw new common_1.BadRequestException('Registration link must start with http');
            }
            const organizers = await this.prisma.user.findMany({
                where: {
                    id: { in: data.organizerIds },
                    role: roles_decorator_1.Role.ORGANIZER,
                },
            });
            if (organizers.length !== data.organizerIds.length) {
                throw new common_1.BadRequestException('One or more invalid organizer IDs');
            }
            const slug = this.generateSlug(data.title);
            const event = await this.prisma.event.create({
                data: {
                    title: data.title,
                    description: data.description || '',
                    date: eventDate,
                    location: data.location || '',
                    capacity: 0,
                    image: data.image,
                    category: data.category,
                    type: data.type,
                    eventTag: data.eventTag,
                    registrationLink: data.registrationLink,
                    slug,
                    pageContent: data.pageContent,
                    pageSettings: data.pageSettings,
                    organizers: {
                        create: data.organizerIds.map((organizerId, index) => ({
                            organizerId,
                            isHost: index === 0,
                        })),
                    },
                    speakers: data.speakerRequests ? {
                        create: data.speakerRequests.map(request => ({
                            speakerId: request.speakerId,
                            topic: request.topic,
                            description: request.description,
                            status: client_1.SpeakerStatus.PENDING,
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
            for (const organizer of organizers) {
                await this.emailService.sendMail({
                    to: organizer.email,
                    subject: `New Event Assignment: ${data.title}`,
                    text: `You have been assigned as ${organizer.id === data.organizerIds[0] ? 'host' : 'organizer'} for the event "${data.title}".`,
                });
            }
            return event;
        }
        catch (error) {
            console.error('🚨 [AdminService] Error creating event:', error.message);
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
            include: { organizers: { include: { organizer: true } } },
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
                        console.log(`ℹ️ [AdminService] Deleted image file: ${filePath}`);
                    }
                    catch (err) {
                        console.error(`🚨 [AdminService] Error deleting image file: ${filePath}`, err.message);
                    }
                }
            }
            await this.prisma.event.delete({ where: { id: eventId } });
            const host = event.organizers.find(o => o.isHost).organizer;
            await this.emailService.sendMail({
                to: host.email,
                subject: `Event "${event.title}" Declined`,
                text: `The event "${event.title}" was deleted because a collaborator declined.`,
            });
            return { message: 'Event declined and deleted' };
        }
        await this.prisma.eventOrganizer.update({
            where: { eventId_organizerId: { eventId, organizerId } },
            data: { pendingConfirmation: false, expiresAt: null },
        });
        const updatedEvent = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: true },
        });
        const allConfirmed = updatedEvent.organizers.every(o => !o.pendingConfirmation);
        if (allConfirmed) {
            await this.prisma.event.update({
                where: { id: eventId },
                data: { status: client_1.EventStatus.PUBLISHED },
            });
            const hostId = updatedEvent.organizers.find(o => o.isHost).organizerId;
            const host = await this.prisma.user.findUnique({ where: { id: hostId } });
            await this.emailService.sendMail({
                to: host.email,
                subject: `Event "${event.title}" Published`,
                text: `The event "${event.title}" is now PUBLISHED with all organizers confirmed.`,
            });
        }
        return { message: confirm ? 'Participation confirmed' : 'Participation declined' };
    }
    async updateEvent(id, data) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { organizers: { select: { organizerId: true, isHost: true } } },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (data.date) {
            const eventDate = new Date(data.date);
            if (isNaN(eventDate.getTime())) {
                throw new common_1.BadRequestException('Invalid date format');
            }
            data.date = eventDate.toISOString();
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
        if (data.category && data.type) {
            updateData.eventTag = `${data.category}-${data.type}`;
        }
        return this.prisma.event.update({
            where: { id },
            data: updateData,
            include: { organizers: { include: { organizer: { select: { id: true, name: true } } } } },
        });
    }
    async deleteEvent(id) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.image) {
            const otherEvents = await this.prisma.event.findMany({
                where: { image: event.image, id: { not: id } },
            });
            if (otherEvents.length === 0) {
                const filePath = path.join(process.cwd(), event.image);
                try {
                    await fs.unlink(filePath);
                    console.log(`ℹ️ [AdminService] Deleted image file: ${filePath}`);
                }
                catch (err) {
                    console.error(`🚨 [AdminService] Error deleting image file: ${filePath}`, err.message);
                }
            }
        }
        await this.prisma.event.delete({ where: { id } });
        return { message: 'Event deleted successfully' };
    }
};
AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_service_1.UserService,
        email_service_1.EmailService])
], AdminService);
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map