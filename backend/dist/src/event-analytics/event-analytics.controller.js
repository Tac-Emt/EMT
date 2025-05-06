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
exports.EventAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const event_analytics_service_1 = require("./event-analytics.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_1 = require("../auth/roles");
let EventAnalyticsController = class EventAnalyticsController {
    constructor(eventAnalyticsService) {
        this.eventAnalyticsService = eventAnalyticsService;
    }
    async createEventAnalytics(eventId) {
        return this.eventAnalyticsService.createEventAnalytics(+eventId);
    }
    async getEventAnalytics(eventId) {
        return this.eventAnalyticsService.getEventAnalytics(+eventId);
    }
    async updateEventAnalytics(eventId, data) {
        return this.eventAnalyticsService.updateEventAnalytics(+eventId, data);
    }
    async incrementEventViews(eventId) {
        return this.eventAnalyticsService.incrementEventViews(+eventId);
    }
    async getEventStats(eventId) {
        return this.eventAnalyticsService.getEventStats(+eventId);
    }
};
__decorate([
    (0, common_1.Post)('event/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventAnalyticsController.prototype, "createEventAnalytics", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventAnalyticsController.prototype, "getEventAnalytics", null);
__decorate([
    (0, common_1.Post)('event/:eventId/update'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventAnalyticsController.prototype, "updateEventAnalytics", null);
__decorate([
    (0, common_1.Post)('event/:eventId/increment-views'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventAnalyticsController.prototype, "incrementEventViews", null);
__decorate([
    (0, common_1.Get)('event/:eventId/stats'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventAnalyticsController.prototype, "getEventStats", null);
EventAnalyticsController = __decorate([
    (0, common_1.Controller)('event-analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [event_analytics_service_1.EventAnalyticsService])
], EventAnalyticsController);
exports.EventAnalyticsController = EventAnalyticsController;
//# sourceMappingURL=event-analytics.controller.js.map