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
exports.EventResourceController = void 0;
const common_1 = require("@nestjs/common");
const event_resource_service_1 = require("./event-resource.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_1 = require("../auth/roles");
let EventResourceController = class EventResourceController {
    constructor(eventResourceService) {
        this.eventResourceService = eventResourceService;
    }
    async createResource(data) {
        return this.eventResourceService.createResource(data);
    }
    async getEventResources(eventId) {
        return this.eventResourceService.getEventResources(+eventId);
    }
    async getResource(id) {
        return this.eventResourceService.getResource(+id);
    }
    async updateResource(id, data) {
        return this.eventResourceService.updateResource(+id, data);
    }
    async deleteResource(id) {
        return this.eventResourceService.deleteResource(+id);
    }
    async getResourceStats(eventId) {
        return this.eventResourceService.getResourceStats(+eventId);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventResourceController.prototype, "createResource", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventResourceController.prototype, "getEventResources", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventResourceController.prototype, "getResource", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventResourceController.prototype, "updateResource", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventResourceController.prototype, "deleteResource", null);
__decorate([
    (0, common_1.Get)('stats/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventResourceController.prototype, "getResourceStats", null);
EventResourceController = __decorate([
    (0, common_1.Controller)('event-resources'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [event_resource_service_1.EventResourceService])
], EventResourceController);
exports.EventResourceController = EventResourceController;
//# sourceMappingURL=event-resource.controller.js.map