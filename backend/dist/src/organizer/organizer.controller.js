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
exports.EventController = void 0;
const common_1 = require("@nestjs/common");
const organizer_service_1 = require("./organizer.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "DRAFT";
    EventStatus["PUBLISHED"] = "PUBLISHED";
    EventStatus["CANCELLED"] = "CANCELLED";
})(EventStatus || (EventStatus = {}));
var EventCategory;
(function (EventCategory) {
    EventCategory["CS"] = "CS";
    EventCategory["RAS"] = "RAS";
    EventCategory["IAS"] = "IAS";
    EventCategory["WIE"] = "WIE";
})(EventCategory || (EventCategory = {}));
var EventType;
(function (EventType) {
    EventType["CONGRESS"] = "CONGRESS";
    EventType["CONFERENCE"] = "CONFERENCE";
    EventType["HACKATHON"] = "HACKATHON";
    EventType["NORMAL"] = "NORMAL";
    EventType["ONLINE"] = "ONLINE";
})(EventType || (EventType = {}));
let EventController = class EventController {
    constructor(eventService) {
        this.eventService = eventService;
    }
    async createEvent(data, req) {
        try {
            console.log('ℹ️ [OrganizerController] Creating event:', { data });
            const event = await this.eventService.createEvent(req.user.id, data);
            return { message: 'Event created successfully', data: event };
        }
        catch (error) {
            console.error('🚨 [OrganizerController] Error creating event:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to create event: ' + error.message);
        }
    }
    async confirmEventParticipation(req, id, body) {
        try {
            const eventId = parseInt(id);
            if (isNaN(eventId)) {
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            }
            if (typeof body.confirm !== 'boolean') {
                throw new common_1.BadRequestException('Confirm must be a boolean');
            }
            const result = await this.eventService.confirmEventParticipation(eventId, req.user.id, body.confirm);
            return {
                message: result.message,
                event: null,
            };
        }
        catch (error) {
            console.error('🚨 [EventController] Error confirming participation:', error.message);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to confirm participation: ' + error.message);
        }
    }
    async getEvents(req, page = '1', limit = '10') {
        try {
            const organizerId = req.user.id;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            if (isNaN(pageNum) || pageNum < 1) {
                throw new common_1.BadRequestException('Page must be a positive integer');
            }
            if (isNaN(limitNum) || limitNum < 1) {
                throw new common_1.BadRequestException('Limit must be a positive integer');
            }
            console.log('ℹ️ [EventController] Fetching events for organizer:', organizerId);
            return await this.eventService.getOrganizerEvents(organizerId, pageNum, limitNum);
        }
        catch (error) {
            console.error('🚨 [EventController] Error fetching events:', error.message);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch events: ' + error.message);
        }
    }
    async getEventById(req, id) {
        try {
            const organizerId = req.user.id;
            const eventId = parseInt(id);
            if (isNaN(eventId)) {
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            }
            const event = await this.eventService.getEventById(eventId);
            return {
                message: 'Event fetched successfully',
                event,
            };
        }
        catch (error) {
            console.error('🚨 [EventController] Error fetching event by ID:', error.message);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch event: ' + error.message);
        }
    }
    async updateEvent(id, body, req) {
        const eventId = parseInt(id);
        if (isNaN(eventId)) {
            throw new common_1.BadRequestException('Invalid event ID');
        }
        return this.eventService.updateEvent(eventId, req.user.id, body);
    }
    async deleteEvent(req, id) {
        try {
            const organizerId = req.user.id;
            const eventId = parseInt(id);
            if (isNaN(eventId)) {
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            }
            const result = await this.eventService.deleteEvent(eventId, organizerId);
            return {
                message: 'Event deleted successfully',
                details: result,
            };
        }
        catch (error) {
            console.error('🚨 [EventController] Error deleting event:', error.message);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete event: ' + error.message);
        }
    }
    validateEventStatus(status) {
        const validStatuses = Object.values(EventStatus);
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException(`Invalid status value: ${status}. Must be one of ${validStatuses.join(', ')}`);
        }
        return status;
    }
};
__decorate([
    (0, common_1.Post)('events'),
    (0, roles_decorator_1.Roles)('ORGANIZER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "confirmEventParticipation", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "getEventById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "deleteEvent", null);
EventController = __decorate([
    (0, common_1.Controller)('organizer/events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER'),
    __metadata("design:paramtypes", [organizer_service_1.EventService])
], EventController);
exports.EventController = EventController;
//# sourceMappingURL=organizer.controller.js.map