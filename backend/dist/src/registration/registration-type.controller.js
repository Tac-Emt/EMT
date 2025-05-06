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
exports.RegistrationTypeController = void 0;
const common_1 = require("@nestjs/common");
const registration_type_service_1 = require("./registration-type.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let RegistrationTypeController = class RegistrationTypeController {
    constructor(registrationTypeService) {
        this.registrationTypeService = registrationTypeService;
    }
    async createRegistrationType(data) {
        return this.registrationTypeService.createRegistrationType(data);
    }
    async getRegistrationTypes(eventId) {
        return this.registrationTypeService.getRegistrationTypes(+eventId);
    }
    async getRegistrationType(id) {
        return this.registrationTypeService.getRegistrationType(+id);
    }
    async updateRegistrationType(id, data) {
        return this.registrationTypeService.updateRegistrationType(+id, data);
    }
    async deleteRegistrationType(id) {
        return this.registrationTypeService.deleteRegistrationType(+id);
    }
    async checkAvailability(id) {
        return this.registrationTypeService.checkAvailability(+id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ORGANIZER, roles_decorator_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RegistrationTypeController.prototype, "createRegistrationType", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.USER, roles_decorator_1.Role.ORGANIZER, roles_decorator_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationTypeController.prototype, "getRegistrationTypes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.USER, roles_decorator_1.Role.ORGANIZER, roles_decorator_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationTypeController.prototype, "getRegistrationType", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ORGANIZER, roles_decorator_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegistrationTypeController.prototype, "updateRegistrationType", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.Role.ORGANIZER, roles_decorator_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationTypeController.prototype, "deleteRegistrationType", null);
__decorate([
    (0, common_1.Get)(':id/availability'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationTypeController.prototype, "checkAvailability", null);
RegistrationTypeController = __decorate([
    (0, common_1.Controller)('registration-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [registration_type_service_1.RegistrationTypeService])
], RegistrationTypeController);
exports.RegistrationTypeController = RegistrationTypeController;
//# sourceMappingURL=registration-type.controller.js.map