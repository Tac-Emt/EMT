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
exports.EventSeriesController = void 0;
const common_1 = require("@nestjs/common");
const event_series_service_1 = require("./event-series.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let EventSeriesController = class EventSeriesController {
    constructor(eventSeriesService) {
        this.eventSeriesService = eventSeriesService;
    }
    async createSeries(data) {
        return this.eventSeriesService.createSeries(data);
    }
    async getAllSeries() {
        return this.eventSeriesService.getAllSeries();
    }
    async getSeries(id) {
        return this.eventSeriesService.getSeries(+id);
    }
    async updateSeries(id, data) {
        return this.eventSeriesService.updateSeries(+id, data);
    }
    async deleteSeries(id) {
        return this.eventSeriesService.deleteSeries(+id);
    }
    async addEventToSeries(seriesId, eventId) {
        return this.eventSeriesService.addEventToSeries(+seriesId, +eventId);
    }
    async removeEventFromSeries(seriesId, eventId) {
        return this.eventSeriesService.removeEventFromSeries(+seriesId, +eventId);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ADMIN, roles_decorator_1.Role.ORGANIZER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventSeriesController.prototype, "createSeries", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventSeriesController.prototype, "getAllSeries", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventSeriesController.prototype, "getSeries", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ADMIN, roles_decorator_1.Role.ORGANIZER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventSeriesController.prototype, "updateSeries", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventSeriesController.prototype, "deleteSeries", null);
__decorate([
    (0, common_1.Post)(':seriesId/events/:eventId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ADMIN, roles_decorator_1.Role.ORGANIZER),
    __param(0, (0, common_1.Param)('seriesId')),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventSeriesController.prototype, "addEventToSeries", null);
__decorate([
    (0, common_1.Delete)(':seriesId/events/:eventId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ADMIN, roles_decorator_1.Role.ORGANIZER),
    __param(0, (0, common_1.Param)('seriesId')),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventSeriesController.prototype, "removeEventFromSeries", null);
EventSeriesController = __decorate([
    (0, common_1.Controller)('event-series'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [event_series_service_1.EventSeriesService])
], EventSeriesController);
exports.EventSeriesController = EventSeriesController;
//# sourceMappingURL=event-series.controller.js.map