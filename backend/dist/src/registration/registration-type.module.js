"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationTypeModule = void 0;
const common_1 = require("@nestjs/common");
const registration_type_controller_1 = require("./registration-type.controller");
const registration_type_service_1 = require("./registration-type.service");
const prisma_service_1 = require("../prisma/prisma.service");
let RegistrationTypeModule = class RegistrationTypeModule {
};
RegistrationTypeModule = __decorate([
    (0, common_1.Module)({
        controllers: [registration_type_controller_1.RegistrationTypeController],
        providers: [registration_type_service_1.RegistrationTypeService, prisma_service_1.PrismaService],
        exports: [registration_type_service_1.RegistrationTypeService],
    })
], RegistrationTypeModule);
exports.RegistrationTypeModule = RegistrationTypeModule;
//# sourceMappingURL=registration-type.module.js.map