"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const admin_module_1 = require("./admin/admin.module");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const feed_module_1 = require("./feed/feed.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const email_module_1 = require("./email/email.module");
const event_module_1 = require("./event/event.module");
const registration_module_1 = require("./registration/registration.module");
const speaker_module_1 = require("./speaker/speaker.module");
const event_task_module_1 = require("./event-task/event-task.module");
const check_in_module_1 = require("./check-in/check-in.module");
const file_upload_module_1 = require("./file-upload/file-upload.module");
const prisma_module_1 = require("./prisma/prisma.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'Uploads'),
                serveRoot: '/uploads',
            }),
            prisma_module_1.PrismaModule,
            admin_module_1.AdminModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            feed_module_1.FeedModule,
            scheduler_module_1.SchedulerModule,
            email_module_1.EmailModule,
            event_module_1.EventModule,
            registration_module_1.RegistrationModule,
            speaker_module_1.SpeakerModule,
            event_task_module_1.EventTaskModule,
            check_in_module_1.CheckInModule,
            file_upload_module_1.FileUploadModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map