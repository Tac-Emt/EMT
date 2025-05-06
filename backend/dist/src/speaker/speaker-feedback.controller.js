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
exports.SpeakerFeedbackController = void 0;
const common_1 = require("@nestjs/common");
const speaker_feedback_service_1 = require("./speaker-feedback.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_1 = require("../auth/roles");
let SpeakerFeedbackController = class SpeakerFeedbackController {
    constructor(speakerFeedbackService) {
        this.speakerFeedbackService = speakerFeedbackService;
    }
    async createFeedback(data) {
        return this.speakerFeedbackService.createFeedback(data);
    }
    async getFeedback(id) {
        return this.speakerFeedbackService.getFeedback(+id);
    }
    async getEventFeedbacks(eventId) {
        return this.speakerFeedbackService.getEventFeedbacks(+eventId);
    }
    async getSpeakerFeedbacks(speakerId) {
        return this.speakerFeedbackService.getSpeakerFeedbacks(+speakerId);
    }
    async updateFeedback(id, data) {
        return this.speakerFeedbackService.updateFeedback(+id, data);
    }
    async deleteFeedback(id) {
        return this.speakerFeedbackService.deleteFeedback(+id);
    }
    async getSpeakerStats(speakerId) {
        return this.speakerFeedbackService.getSpeakerStats(+speakerId);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpeakerFeedbackController.prototype, "createFeedback", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerFeedbackController.prototype, "getFeedback", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerFeedbackController.prototype, "getEventFeedbacks", null);
__decorate([
    (0, common_1.Get)('speaker/:speakerId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('speakerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerFeedbackController.prototype, "getSpeakerFeedbacks", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpeakerFeedbackController.prototype, "updateFeedback", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerFeedbackController.prototype, "deleteFeedback", null);
__decorate([
    (0, common_1.Get)('speaker/:speakerId/stats'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('speakerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakerFeedbackController.prototype, "getSpeakerStats", null);
SpeakerFeedbackController = __decorate([
    (0, common_1.Controller)('speaker-feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [speaker_feedback_service_1.SpeakerFeedbackService])
], SpeakerFeedbackController);
exports.SpeakerFeedbackController = SpeakerFeedbackController;
//# sourceMappingURL=speaker-feedback.controller.js.map