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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const admin_service_1 = require("./admin.service");
const user_service_1 = require("../user/user.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const client_1 = require("@prisma/client");
const roles_decorator_2 = require("../auth/decorators/roles.decorator");
const multer_1 = require("multer");
const path_1 = require("path");
let AdminController = class AdminController {
    constructor(adminService, userService) {
        this.adminService = adminService;
        this.userService = userService;
    }
    async getAllUsers() {
        try {
            console.log('ℹ️ [AdminController] Fetching all users');
            const users = await this.adminService.getAllUsers();
            return { message: 'Users fetched successfully', data: users };
        }
        catch (error) {
            console.error('🚨 [AdminController] Error fetching users:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to fetch users: ' + error.message);
        }
    }
    async createUser(createUserDto) {
        try {
            const { email, password, name, role } = createUserDto;
            if (!email || !password || !name || !role) {
                throw new common_1.BadRequestException('Email, password, name, and role are required');
            }
            const validRoles = Object.values(roles_decorator_2.Role);
            if (!validRoles.includes(role)) {
                throw new common_1.BadRequestException(`Invalid role value: ${role}. Must be one of ${validRoles.join(', ')}`);
            }
            console.log('ℹ️ [AdminController] Creating user:', { email, name, role });
            const newUser = await this.adminService.createUser(email, password, name, role);
            return { message: 'User created successfully', data: newUser };
        }
        catch (error) {
            console.error('🚨 [AdminController] Error creating user:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to create user: ' + error.message);
        }
    }
    async updateUser(id, data) {
        try {
            const userId = parseInt(id);
            if (isNaN(userId))
                throw new common_1.BadRequestException('User ID must be a valid integer');
            if (data.role) {
                const validRoles = Object.values(roles_decorator_2.Role);
                if (!validRoles.includes(data.role)) {
                    throw new common_1.BadRequestException(`Invalid role value: ${data.role}. Must be one of ${validRoles.join(', ')}`);
                }
            }
            console.log('ℹ️ [AdminController] Updating user:', { id: userId, data });
            const updatedUser = await this.adminService.updateUser(userId, Object.assign(Object.assign({}, data), { role: data.role }));
            return { message: 'User updated successfully', data: updatedUser };
        }
        catch (error) {
            console.error('🚨 [AdminController] Error updating user:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to update user: ' + error.message);
        }
    }
    async deleteUser(id) {
        try {
            const userId = parseInt(id);
            if (isNaN(userId))
                throw new common_1.BadRequestException('User ID must be a valid integer');
            console.log('ℹ️ [AdminController] Deleting user:', userId);
            const result = await this.adminService.deleteUser(userId);
            return result;
        }
        catch (error) {
            console.error('🚨 [AdminController] Error deleting user:', error.message);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to delete user: ' + error.message);
        }
    }
    async getAllEvents() {
        try {
            console.log('ℹ️ [AdminController] Fetching all events');
            const events = await this.adminService.getAllEvents();
            return { message: 'Events fetched successfully', data: events };
        }
        catch (error) {
            console.error('🚨 [AdminController] Error fetching events:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to fetch events: ' + error.message);
        }
    }
    async createEvent(data) {
        try {
            console.log('ℹ️ [AdminController] Creating event:', { data });
            const event = await this.adminService.createEvent(data);
            return { message: 'Event created successfully', data: event };
        }
        catch (error) {
            console.error('🚨 [AdminController] Error creating event:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to create event: ' + error.message);
        }
    }
    async updateEvent(id, file, body) {
        try {
            const eventId = parseInt(id);
            if (isNaN(eventId))
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            const { title, description, date, organizerId, status, location, category, type, existingImageUrl, registrationLink, pageContent, pageSettings } = body;
            if (title && (typeof title !== 'string' || title.trim().length === 0)) {
                throw new common_1.BadRequestException('Title must be a non-empty string');
            }
            if (date && isNaN(new Date(date).getTime())) {
                throw new common_1.BadRequestException('Date must be a valid ISO date string');
            }
            if (organizerId) {
                const parsedOrganizerId = parseInt(organizerId);
                if (isNaN(parsedOrganizerId))
                    throw new common_1.BadRequestException('Organizer ID must be a valid integer');
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
            const parsedOrganizerId = organizerId ? parseInt(organizerId) : undefined;
            const imagePath = existingImageUrl || (file ? `/uploads/${file.filename}` : undefined);
            console.log('ℹ️ [AdminController] Updating event:', { id: eventId, data: body, imagePath });
            const updatedEvent = await this.adminService.updateEvent(eventId, {
                title,
                description,
                date,
                organizerId: parsedOrganizerId,
                status: validatedStatus,
                location,
                image: imagePath,
                category: validatedCategory,
                type: validatedType,
                registrationLink,
                pageContent,
                pageSettings,
            });
            return { message: 'Event updated successfully', data: updatedEvent };
        }
        catch (error) {
            console.error('🚨 [AdminController] Error updating event:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to update event: ' + error.message);
        }
    }
    async deleteEvent(id) {
        try {
            const eventId = parseInt(id);
            if (isNaN(eventId))
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            console.log('ℹ️ [AdminController] Deleting event:', eventId);
            const result = await this.adminService.deleteEvent(eventId);
            return result;
        }
        catch (error) {
            console.error('🚨 [AdminController] Error deleting event:', error.message);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to delete event: ' + error.message);
        }
    }
    async confirmEventParticipation(id, body) {
        try {
            const eventId = parseInt(id);
            if (isNaN(eventId))
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            if (typeof body.confirm !== 'boolean')
                throw new common_1.BadRequestException('Confirm must be a boolean');
            const { organizerId } = body;
            const parsedOrganizerId = parseInt(organizerId);
            if (isNaN(parsedOrganizerId))
                throw new common_1.BadRequestException('Organizer ID must be a valid integer');
            console.log('ℹ️ [AdminController] Confirming participation:', { eventId, organizerId: parsedOrganizerId, confirm: body.confirm });
            const result = await this.adminService.confirmEventParticipation(eventId, parsedOrganizerId, body.confirm);
            return { message: result.message, data: null };
        }
        catch (error) {
            console.error('🚨 [AdminController] Error confirming participation:', error.message);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to confirm participation: ' + error.message);
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
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllEvents", null);
__decorate([
    (0, common_1.Post)('events'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Put)('events/:id'),
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
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "confirmEventParticipation", null);
AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        user_service_1.UserService])
], AdminController);
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map