"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTaskModule = void 0;
const common_1 = require("@nestjs/common");
const event_task_controller_1 = require("./event-task.controller");
const event_task_service_1 = require("./event-task.service");
const prisma_service_1 = require("../prisma/prisma.service");
let EventTaskModule = class EventTaskModule {
};
EventTaskModule = __decorate([
    (0, common_1.Module)({
        controllers: [event_task_controller_1.EventTaskController],
        providers: [event_task_service_1.EventTaskService, prisma_service_1.PrismaService],
        exports: [event_task_service_1.EventTaskService],
    })
], EventTaskModule);
exports.EventTaskModule = EventTaskModule;
//# sourceMappingURL=event-task.module.js.map