"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizerGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let OrganizerGuard = class OrganizerGuard {
    log(message, type) {
        const emojis = {
            INFO: 'ℹ️',
            ERROR: '❌',
            SUCCESS: '✅',
        };
        console.log(`${emojis[type]} [OrganizerGuard] ${message}`);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        this.log(`Incoming request - User: ${user ? JSON.stringify(user) : 'not provided'}`, 'INFO');
        if (!user || !user.role) {
            this.log('No user or role found in request', 'ERROR');
            throw new common_1.UnauthorizedException('User or role not found');
        }
        if (user.role !== client_1.Role.ORGANIZER) {
            this.log(`Role check failed - Expected: ORGANIZER, Got: ${user.role}`, 'ERROR');
            throw new common_1.UnauthorizedException('Only organizers can access this resource');
        }
        this.log('Access granted to organizer', 'SUCCESS');
        return true;
    }
};
OrganizerGuard = __decorate([
    (0, common_1.Injectable)()
], OrganizerGuard);
exports.OrganizerGuard = OrganizerGuard;
//# sourceMappingURL=organizer.guard.js.map