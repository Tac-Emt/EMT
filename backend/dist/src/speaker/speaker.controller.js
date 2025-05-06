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
exports.SpeakerController = void 0;
const common_1 = require("@nestjs/common");
const speaker_service_1 = require("./speaker.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_1 = require("../auth/roles");
let SpeakerController = class SpeakerController {
    constructor(speakerService) {
        this.speakerService = speakerService;
    }
    async createSpeaker(data) {
        return this.speakerService.createSpeaker(data);
    }
    async getSpeakers() {
        return this.speakerService.getSpeakers();
    }
    async getSpeaker(id) {
        return this.speakerService.getSpeaker(+id);
    }
    async updateSpeaker(id, data) {
        return this.speakerService.updateSpeaker(+id, data);
    }
    async deleteSpeaker(id) {
        return this.speakerService.deleteSpeaker(+id);
    }
    async getSpeakerStats(id) {
        return this.speakerService.getSpeakerStats(+id);
    }
    async getSpeakerEvents(speakerId) {
        try {
            console.log('ℹ️ [SpeakerController] Fetching speaker events:', speakerId);
            const events = await this.speakerService.getSpeakerEvents(speakerId);
            return { message: 'Events fetched successfully', data: events };
        }
        catch (error) {
            console.error('🚨 [SpeakerController] Error fetching events:', error.message);
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to fetch events: ' + error.message);
        }
    }
    async getPendingRequests(speakerId) {
        try {
            console.log('ℹ️ [SpeakerController] Fetching pending requests:', speakerId);
            const requests = await this.speakerService.getPendingRequests(speakerId);
            return { message: 'Pending requests fetched successfully', data: requests };
        }
        catch (error) {
            console.error('🚨 [SpeakerController] Error fetching requests:', error.message);
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to fetch requests: ' + error.message);
        }
    }
    async respondToRequest(eventId, body) {
        try {
            const parsedEventId = parseInt(eventId);
            if (isNaN(parsedEventId)) {
                throw new common_1.BadRequestException('Event ID must be a valid integer');
            }
            console.log('ℹ️ [SpeakerController] Responding to request:', {
                eventId: parsedEventId,
                speakerId: body.speakerId,
                accept: body.accept,
            });
            const result = await this.speakerService.respondToRequest(parsedEventId, body.speakerId, body.accept);
            return {
                message: `Request ${body.accept ? 'accepted' : 'rejected'} successfully`,
                data: result,
            };
        }
        catch (error) {
            console.error('🚨 [SpeakerController] Error responding to request:', error.message);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to respond to request: ' + error.message);
        }
    }
    async getSpeakerProfile(speakerId) {
        try {
            console.log('ℹ️ [SpeakerController] Fetching speaker profile:', speakerId);
            const profile = await this.speakerService.getSpeakerProfile(speakerId);
            return { message: 'Profile fetched successfully', data: profile };
        }
        catch (error) {
            console.error('🚨 [SpeakerController] Error fetching profile:', error.message);
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to fetch profile: ' + error.message);
        }
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "createSpeaker", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "getSpeakers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "getSpeaker", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "updateSpeaker", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "deleteSpeaker", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "getSpeakerStats", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Body)('speakerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "getSpeakerEvents", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Body)('speakerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Post)('requests/:eventId/respond'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "respondToRequest", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Body)('speakerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SpeakerController.prototype, "getSpeakerProfile", null);
SpeakerController = __decorate([
    (0, common_1.Controller)('speakers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [speaker_service_1.SpeakerService])
], SpeakerController);
exports.SpeakerController = SpeakerController;
//# sourceMappingURL=speaker.controller.js.map