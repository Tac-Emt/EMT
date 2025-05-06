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
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FeedService = class FeedService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFeedEvents(organizerIds, categories, types) {
        const now = new Date();
        try {
            console.log('🔍 [FeedService] Fetching events with filters', {
                organizerIds,
                categories,
                types,
            });
            if (organizerIds === null || organizerIds === void 0 ? void 0 : organizerIds.length) {
                const organizers = await this.prisma.user.findMany({
                    where: {
                        id: { in: organizerIds },
                        role: client_1.Role.ORGANIZER,
                    },
                });
                if (organizers.length !== organizerIds.length) {
                    const invalidIds = organizerIds.filter(id => !organizers.some(org => org.id === id));
                    throw new common_1.BadRequestException(`Invalid organizer IDs: ${invalidIds.join(', ')}`);
                }
            }
            if (categories === null || categories === void 0 ? void 0 : categories.length) {
                const validCategories = Object.values(client_1.EventCategory);
                const invalidCategories = categories.filter(c => !validCategories.includes(c));
                if (invalidCategories.length) {
                    throw new common_1.BadRequestException(`Invalid categories: ${invalidCategories.join(', ')}. Must be one of ${validCategories.join(', ')}`);
                }
            }
            if (types === null || types === void 0 ? void 0 : types.length) {
                const validTypes = Object.values(client_1.EventType);
                const invalidTypes = types.filter(t => !validTypes.includes(t));
                if (invalidTypes.length) {
                    throw new common_1.BadRequestException(`Invalid types: ${invalidTypes.join(', ')}. Must be one of ${validTypes.join(', ')}`);
                }
            }
            const events = await this.prisma.event.findMany({
                where: Object.assign(Object.assign(Object.assign({ date: { gt: now }, status: client_1.EventStatus.PUBLISHED }, ((organizerIds === null || organizerIds === void 0 ? void 0 : organizerIds.length)
                    ? { organizers: { some: { organizerId: { in: organizerIds } } } }
                    : {})), ((categories === null || categories === void 0 ? void 0 : categories.length) ? { category: { in: categories } } : {})), ((types === null || types === void 0 ? void 0 : types.length) ? { type: { in: types } } : {})),
                include: {
                    organizers: {
                        include: {
                            organizer: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    date: 'asc',
                },
            });
            const formattedEvents = events.map(event => (Object.assign(Object.assign({}, event), { image: event.image ? `data:image/jpeg;base64,${event.image}` : null, organizers: event.organizers.map(o => ({
                    id: o.organizer.id,
                    name: o.organizer.name,
                    isHost: o.isHost,
                })) })));
            console.log('✅ [FeedService] Fetched', formattedEvents.length, 'events with filters');
            return formattedEvents;
        }
        catch (error) {
            console.error('🚨 [FeedService] Error fetching events:', error.message);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch feed events: ' + error.message);
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔍 [FeedService] Fetching filter options');
            const organizers = await this.prisma.user.findMany({
                where: {
                    role: client_1.Role.ORGANIZER,
                    organizedEvents: {
                        some: {
                            event: {
                                status: client_1.EventStatus.PUBLISHED,
                                date: { gt: new Date() },
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                },
                orderBy: {
                    name: 'asc',
                },
            });
            const categories = Object.values(client_1.EventCategory);
            const types = Object.values(client_1.EventType);
            console.log('✅ [FeedService] Fetched filter options');
            return { organizers, categories, types };
        }
        catch (error) {
            console.error('🚨 [FeedService] Error fetching filter options:', error.message);
            throw new common_1.InternalServerErrorException('Failed to fetch filter options: ' + error.message);
        }
    }
};
FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedService);
exports.FeedService = FeedService;
//# sourceMappingURL=feed.service.js.map