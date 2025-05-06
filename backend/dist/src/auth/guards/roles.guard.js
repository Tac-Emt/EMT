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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const role_enum_1 = require("../enums/role.enum");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        var _a;
        const requiredRoles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (user.role === role_enum_1.Role.ADMIN) {
            return true;
        }
        if (user.role === role_enum_1.Role.ORGANIZER) {
            if (requiredRoles.includes(role_enum_1.Role.ORGANIZER)) {
                const request = context.switchToHttp().getRequest();
                const eventId = request.params.eventId || request.body.eventId;
                if (eventId) {
                    return (_a = user.organizedEvents) === null || _a === void 0 ? void 0 : _a.some(event => event.id === Number(eventId));
                }
                if (request.method === 'GET' && request.path.includes('speakers')) {
                    return true;
                }
                return false;
            }
        }
        if (user.role === role_enum_1.Role.SPEAKER) {
            if (requiredRoles.includes(role_enum_1.Role.SPEAKER)) {
                const request = context.switchToHttp().getRequest();
                const speakerId = request.params.id || request.user.id;
                return user.id === Number(speakerId);
            }
        }
        if (user.role === role_enum_1.Role.USER) {
            if (requiredRoles.includes(role_enum_1.Role.USER)) {
                const request = context.switchToHttp().getRequest();
                const userId = request.params.id || request.user.id;
                return user.id === Number(userId);
            }
        }
        return requiredRoles.some((role) => user.role === role);
    }
};
RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
exports.RolesGuard = RolesGuard;
//# sourceMappingURL=roles.guard.js.map