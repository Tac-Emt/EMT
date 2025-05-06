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
exports.CheckInController = void 0;
const common_1 = require("@nestjs/common");
const check_in_service_1 = require("./check-in.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_1 = require("../auth/roles");
let CheckInController = class CheckInController {
    constructor(checkInService) {
        this.checkInService = checkInService;
    }
    async generateCheckInCode(eventId) {
        return this.checkInService.generateCheckInCode(+eventId);
    }
    async checkInUser(eventId, userId, data) {
        return this.checkInService.checkInUser({
            eventId: +eventId,
            userId: +userId,
            code: data.code,
        });
    }
    async getEventCheckIns(eventId) {
        return this.checkInService.getEventCheckIns(+eventId);
    }
    async getUserCheckIns(userId) {
        return this.checkInService.getUserCheckIns(+userId);
    }
    async getEventCheckInStats(eventId) {
        return this.checkInService.getEventCheckInStats(+eventId);
    }
};
__decorate([
    (0, common_1.Post)('generate/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "generateCheckInCode", null);
__decorate([
    (0, common_1.Post)(':eventId/user/:userId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "checkInUser", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "getEventCheckIns", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.USER, roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "getUserCheckIns", null);
__decorate([
    (0, common_1.Get)('stats/:eventId'),
    (0, roles_decorator_1.Roles)(roles_1.Role.ORGANIZER, roles_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "getEventCheckInStats", null);
CheckInController = __decorate([
    (0, common_1.Controller)('check-in'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [check_in_service_1.CheckInService])
], CheckInController);
exports.CheckInController = CheckInController;
//# sourceMappingURL=check-in.controller.js.map