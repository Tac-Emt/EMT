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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
const common_1 = require("@nestjs/common");
const feed_service_1 = require("./feed.service");
let FeedController = class FeedController {
    constructor(feedService) {
        this.feedService = feedService;
    }
    async getFeedEvents(organizerIds, categories, types) {
        try {
            let parsedOrganizerIds;
            if (organizerIds) {
                parsedOrganizerIds = organizerIds.split(',').map(id => {
                    const parsed = parseInt(id.trim());
                    if (isNaN(parsed)) {
                        throw new common_1.BadRequestException(`Invalid organizer ID: ${id}`);
                    }
                    return parsed;
                });
                if (!parsedOrganizerIds.length) {
                    parsedOrganizerIds = undefined;
                }
            }
            let parsedCategories;
            if (categories) {
                parsedCategories = categories
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c);
                if (!parsedCategories.length) {
                    parsedCategories = undefined;
                }
            }
            let parsedTypes;
            if (types) {
                parsedTypes = types
                    .split(',')
                    .map(t => t.trim())
                    .filter(t => t);
                if (!parsedTypes.length) {
                    parsedTypes = undefined;
                }
            }
            console.log('ℹ️ [FeedController] Fetching feed events with filters:', {
                organizerIds: parsedOrganizerIds,
                categories: parsedCategories,
                types: parsedTypes,
            });
            const events = await this.feedService.getFeedEvents(parsedOrganizerIds, parsedCategories, parsedTypes);
            return {
                message: 'Events fetched successfully',
                data: events,
            };
        }
        catch (error) {
            console.error('🚨 [FeedController] Error in getFeedEvents:', error.message);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new Error('Failed to fetch events: ' + error.message);
        }
    }
    async getFilterOptions() {
        try {
            console.log('ℹ️ [FeedController] Fetching filter options');
            const options = await this.feedService.getFilterOptions();
            return {
                message: 'Filter options fetched successfully',
                data: options,
            };
        }
        catch (error) {
            console.error('🚨 [FeedController] Error in getFilterOptions:', error.message);
            throw new Error('Failed to fetch filter options: ' + error.message);
        }
    }
};
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('organizerIds')),
    __param(1, (0, common_1.Query)('categories')),
    __param(2, (0, common_1.Query)('types')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getFeedEvents", null);
__decorate([
    (0, common_1.Get)('filters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getFilterOptions", null);
FeedController = __decorate([
    (0, common_1.Controller)('feed'),
    __metadata("design:paramtypes", [feed_service_1.FeedService])
], FeedController);
exports.FeedController = FeedController;
//# sourceMappingURL=feed.controller.js.map