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
exports.EventSeriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventSeriesService = class EventSeriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSeries(data) {
        try {
            return await this.prisma.eventSeries.create({
                data,
                include: {
                    events: {
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
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create event series: ' + error.message);
        }
    }
    async getSeries(id) {
        const series = await this.prisma.eventSeries.findUnique({
            where: { id },
            include: {
                events: {
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
        });
        if (!series) {
            throw new common_1.NotFoundException('Event series not found');
        }
        return series;
    }
    async getAllSeries() {
        return this.prisma.eventSeries.findMany({
            include: {
                events: {
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
        });
    }
    async updateSeries(id, data) {
        try {
            return await this.prisma.eventSeries.update({
                where: { id },
                data,
                include: {
                    events: {
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
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Event series not found');
            }
            throw new common_1.BadRequestException('Failed to update event series: ' + error.message);
        }
    }
    async deleteSeries(id) {
        try {
            await this.prisma.eventSeries.delete({
                where: { id },
            });
            return { message: 'Event series deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Event series not found');
            }
            throw new common_1.BadRequestException('Failed to delete event series: ' + error.message);
        }
    }
    async addEventToSeries(seriesId, eventId) {
        try {
            return await this.prisma.event.update({
                where: { id: eventId },
                data: {
                    series: {
                        connect: { id: seriesId },
                    },
                },
                include: {
                    series: true,
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
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Event or series not found');
            }
            throw new common_1.BadRequestException('Failed to add event to series: ' + error.message);
        }
    }
    async removeEventFromSeries(seriesId, eventId) {
        try {
            return await this.prisma.event.update({
                where: { id: eventId },
                data: {
                    series: {
                        disconnect: { id: seriesId },
                    },
                },
                include: {
                    series: true,
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
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Event or series not found');
            }
            throw new common_1.BadRequestException('Failed to remove event from series: ' + error.message);
        }
    }
};
EventSeriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventSeriesService);
exports.EventSeriesService = EventSeriesService;
//# sourceMappingURL=event-series.service.js.map