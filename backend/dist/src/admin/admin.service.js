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
const prisma_service_1 = require("../prisma.service");
const user_service_1 = require("../user/user.service");
const email_service_1 = require("../email/email.service");
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
        if (!Object.values(client_1.Role).includes(role)) {
            throw new common_1.BadRequestException(`Invalid role value: ${role}. Must be one of ${Object.values(client_1.Role).join(', ')}`);
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
        if (data.role) {
            const validRoles = Object.values(client_1.Role);
            if (!validRoles.includes(data.role)) {
                throw new common_1.BadRequestException(`Invalid role value: ${data.role}. Must be one of ${validRoles.join(', ')}`);
            }
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
        const eventDate = new Date(data.date);
        if (isNaN(eventDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        const host = await this.prisma.user.findUnique({ where: { id: data.organizerId } });
        if (!host || host.role !== 'ORGANIZER') {
            throw new common_1.BadRequestException('Invalid host organizer ID');
        }
        if (data.image && !data.image.startsWith('/uploads/')) {
            throw new common_1.BadRequestException('Invalid image URL. Must start with /uploads/');
        }
        const collaboratorData = [];
        if (data.collaboratorIds && data.collaboratorIds.length > 0) {
            if (data.collaboratorIds.length > 2) {
                throw new common_1.BadRequestException('Maximum 2 collaborators allowed');
            }
            if (data.collaboratorIds.includes(data.organizerId)) {
                throw new common_1.BadRequestException('Host cannot be a collaborator');
            }
            const collaborators = await this.prisma.user.findMany({
                where: { id: { in: data.collaboratorIds }, role: 'ORGANIZER' },
            });
            if (collaborators.length !== data.collaboratorIds.length) {
                const invalidIds = data.collaboratorIds.filter(id => !collaborators.some(c => c.id === id));
                throw new common_1.BadRequestException(`Invalid collaborator IDs: ${invalidIds.join(', ')}`);
            }
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 3);
            for (const id of data.collaboratorIds) {
                collaboratorData.push({
                    organizer: { connect: { id } },
                    isHost: false,
                    pendingConfirmation: true,
                    expiresAt,
                });
                const collaborator = collaborators.find(c => c.id === id);
                await this.emailService.sendMail({
                    to: collaborator.email,
                    subject: `Confirm Participation: ${data.title}`,
                    text: `You’ve been selected as a collaborator for "${data.title}" on ${data.date}. Please confirm within 3 days: http://your-app.com/admin/events/confirm`,
                });
            }
        }
        const eventTag = `${data.category}-${data.type}`;
        const event = await this.prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                date: eventDate,
                status: client_1.EventStatus.DRAFT,
                location: data.location,
                image: data.image,
                category: data.category,
                type: data.type,
                eventTag,
                organizers: {
                    create: [
                        { organizer: { connect: { id: data.organizerId } }, isHost: true, pendingConfirmation: false },
                        ...collaboratorData,
                    ],
                },
            },
            include: { organizers: { include: { organizer: { select: { id: true, name: true } } } } },
        });
        return event;
    }
    async confirmEventParticipation(eventId, organizerId, confirm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: { include: { organizer: true } } },
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
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.status === 'DRAFT') {
            throw new common_1.BadRequestException('Cannot update DRAFT event until all organizers confirm');
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
                    console.log(`ℹ️ [AdminService] Deleted old image file: ${filePath}`);
                }
                catch (err) {
                    console.error(`🚨 [AdminService] Error deleting old image file: ${filePath}`, err.message);
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
        if (data.organizerId) {
            const organizer = await this.prisma.user.findUnique({ where: { id: data.organizerId } });
            if (!organizer || organizer.role !== 'ORGANIZER') {
                throw new common_1.BadRequestException('Invalid organizer ID');
            }
            updateData.organizers = {
                deleteMany: { eventId: id, isHost: false },
                create: [{ organizer: { connect: { id: data.organizerId } }, isHost: false }],
            };
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