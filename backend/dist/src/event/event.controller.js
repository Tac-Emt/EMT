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
const platform_express_1 = require("@nestjs/platform-express");
const event_service_1 = require("./event.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const organizer_guard_1 = require("../auth/guards/organizer.guard");
const client_1 = require("@prisma/client");
const multer_1 = require("multer");
const path_1 = require("path");
let EventController = class EventController {
    constructor(eventService) {
        this.eventService = eventService;
    }
    async createEvent(req, file, body) {
        try {
            const organizerId = req.user.id;
            const { title, description, date, status, location, category, type, collaboratorIds, existingImageUrl } = body;
            if (!title || typeof title !== 'string' || title.trim().length === 0) {
                throw new common_1.BadRequestException('Title is required and must be a non-empty string');
            }
            if (!date || isNaN(new Date(date).getTime())) {
                throw new common_1.BadRequestException('Date is required and must be a valid ISO date string');
            }
            if (!category || !Object.values(client_1.EventCategory).includes(category)) {
                throw new common_1.BadRequestException(`Category is required and must be one of ${Object.values(client_1.EventCategory).join(', ')}`);
            }
            if (!type || !Object.values(client_1.EventType).includes(type)) {
                throw new common_1.BadRequestException(`Type is required and must be one of ${Object.values(client_1.EventType).join(', ')}`);
            }
            let parsedCollaboratorIds;
            if (collaboratorIds) {
                parsedCollaboratorIds = collaboratorIds.split(',').map(id => {
                    const num = parseInt(id.trim());
                    if (isNaN(num) || num <= 0) {
                        throw new common_1.BadRequestException('Collaborator IDs must be positive integers');
                    }
                    return num;
                });
                if (parsedCollaboratorIds.includes(organizerId)) {
                    throw new common_1.BadRequestException('Host cannot be included in collaboratorIds');
                }
            }
            const validatedStatus = status ? this.validateEventStatus(status) : undefined;
            const validatedCategory = category;
            const validatedType = type;
            const imagePath = existingImageUrl || (file ? `/uploads/${file.filename}` : undefined);
            const newEvent = await this.eventService.createEvent(title, description || '', date, organizerId, validatedCategory, validatedType, validatedStatus, location, imagePath, parsedCollaboratorIds);
            return {
                message: 'Event created successfully',
                event: newEvent,
            };
        }
        catch (error) {
            console.error('🚨 [EventController] Error creating event:', error.message);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
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
    async updateEvent(req, id, file, body) {
        try {
            const organizerId = req.user.id;
            const eventId = parseInt(id);
            const { title, description, date, status, location, category, type, existingImageUrl } = body;
            if (isNaN(eventId)) {
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            }
            if (title && (typeof title !== 'string' || title.trim().length === 0)) {
                throw new common_1.BadRequestException('Title must be a non-empty string');
            }
            if (date && isNaN(new Date(date).getTime())) {
                throw new common_1.BadRequestException('Date must be a valid ISO date string');
            }
            if (category && !Object.values(client_1.EventCategory).includes(category)) {
                throw new common_1.BadRequestException(`Category must be one of ${Object.values(client_1.EventCategory).join(', ')}`);
            }
            if (type && !Object.values(client_1.EventType).includes(type)) {
                throw new common_1.BadRequestException(`Type must be one of ${Object.values(client_1.EventType).join(', ')}`);
            }
            const validatedStatus = status ? this.validateEventStatus(status) : undefined;
            const validatedCategory = category;
            const validatedType = type;
            const imagePath = existingImageUrl || (file ? `/uploads/${file.filename}` : undefined);
            const updatedEvent = await this.eventService.updateEvent(eventId, organizerId, {
                title,
                description,
                date,
                status: validatedStatus,
                location,
                image: imagePath,
                category: validatedCategory,
                type: validatedType,
            });
            return {
                message: 'Event updated successfully',
                event: updatedEvent,
            };
        }
        catch (error) {
            console.error('🚨 [EventController] Error updating event:', error.message);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update event: ' + error.message);
        }
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
        const validStatuses = Object.values(client_1.EventStatus);
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException(`Invalid status value: ${status}. Must be one of ${validStatuses.join(', ')}`);
        }
        return status;
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './Uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `image-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new common_1.BadRequestException('Only JPG, JPEG, and PNG files are allowed'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
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
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './Uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `image-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new common_1.BadRequestException('Only JPG, JPEG, and PNG files are allowed'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, organizer_guard_1.OrganizerGuard),
    __metadata("design:paramtypes", [event_service_1.EventService])
], EventController);
exports.EventController = EventController;
//# sourceMappingURL=event.controller.js.map