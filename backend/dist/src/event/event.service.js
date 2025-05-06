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
const file_upload_service_1 = require("../file-upload/file-upload.service");
let EventService = class EventService {
    constructor(prisma, fileUploadService) {
        this.prisma = prisma;
        this.fileUploadService = fileUploadService;
    }
    async create(data) {
        return this.prisma.event.create({ data });
    }
    async findAll() {
        return this.prisma.event.findMany();
    }
    async findOne(id) {
        return this.prisma.event.findUnique({ where: { id } });
    }
    async update(id, data) {
        return this.prisma.event.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.event.delete({ where: { id } });
    }
    async createEvent(data) {
        return this.prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                location: data.location,
                image: data.image,
                category: data.category,
                type: data.type,
                eventTag: data.eventTag,
                status: 'DRAFT',
                capacity: 0,
                slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8),
                organizers: {
                    create: {
                        organizerId: data.organizerId,
                        isHost: true,
                    },
                },
            },
            include: {
                organizers: {
                    include: {
                        organizer: true,
                    },
                },
            },
        });
    }
    async getEvents(filters) {
        return this.prisma.event.findMany({
            where: Object.assign(Object.assign(Object.assign({}, (filters.organizerId && {
                organizers: {
                    some: {
                        organizerId: filters.organizerId,
                    },
                },
            })), (filters.startDate && {
                date: {
                    gte: filters.startDate,
                },
            })), (filters.endDate && {
                date: {
                    lte: filters.endDate,
                },
            })),
            include: {
                organizers: {
                    include: {
                        organizer: true,
                    },
                },
                eventResources: true,
                speakers: {
                    include: {
                        speaker: true,
                    },
                },
            },
        });
    }
    async getEventById(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                organizers: {
                    include: {
                        organizer: true,
                    },
                },
                eventResources: true,
                speakers: {
                    include: {
                        speaker: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async updateEvent(id, data) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                organizers: {
                    include: {
                        organizer: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.image && data.image && event.image !== data.image) {
            await this.fileUploadService.deleteFile(event.image);
        }
        return this.prisma.event.update({
            where: { id },
            data,
            include: {
                organizers: {
                    include: {
                        organizer: true,
                    },
                },
            },
        });
    }
    async deleteEvent(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.image) {
            await this.fileUploadService.deleteFile(event.image);
        }
        await this.prisma.event.delete({
            where: { id },
        });
        return { message: 'Event deleted successfully' };
    }
};
EventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_upload_service_1.FileUploadService])
], EventService);
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map