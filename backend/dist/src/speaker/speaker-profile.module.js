"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeakerProfileModule = void 0;
const common_1 = require("@nestjs/common");
const speaker_profile_controller_1 = require("./speaker-profile.controller");
const speaker_profile_service_1 = require("./speaker-profile.service");
const prisma_service_1 = require("../prisma/prisma.service");
let SpeakerProfileModule = class SpeakerProfileModule {
};
SpeakerProfileModule = __decorate([
    (0, common_1.Module)({
        controllers: [speaker_profile_controller_1.SpeakerProfileController],
        providers: [speaker_profile_service_1.SpeakerProfileService, prisma_service_1.PrismaService],
        exports: [speaker_profile_service_1.SpeakerProfileService],
    })
], SpeakerProfileModule);
exports.SpeakerProfileModule = SpeakerProfileModule;
//# sourceMappingURL=speaker-profile.module.js.map