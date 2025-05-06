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
exports.EventResourceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const file_upload_service_1 = require("../file-upload/file-upload.service");
let EventResourceService = class EventResourceService {
    constructor(prisma, fileUploadService) {
        this.prisma = prisma;
        this.fileUploadService = fileUploadService;
    }
    async createResource(data) {
        return this.prisma.eventResource.create({
            data: {
                title: data.title,
                type: data.type,
                url: data.url,
                event: { connect: { id: data.eventId } },
            },
        });
    }
    async getEventResources(eventId) {
        return this.prisma.eventResource.findMany({
            where: { eventId },
        });
    }
    async getResource(id) {
        const resource = await this.prisma.eventResource.findUnique({
            where: { id },
            include: {
                event: true,
            },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        return resource;
    }
    async updateResource(id, data) {
        const resource = await this.prisma.eventResource.findUnique({
            where: { id },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        if (data.url && resource.url !== data.url) {
            await this.fileUploadService.deleteFile(resource.url);
        }
        return this.prisma.eventResource.update({
            where: { id },
            data,
        });
    }
    async deleteResource(id) {
        const resource = await this.prisma.eventResource.findUnique({
            where: { id },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        await this.fileUploadService.deleteFile(resource.url);
        await this.prisma.eventResource.delete({
            where: { id },
        });
        return { message: 'Resource deleted successfully' };
    }
    async getResourceStats(eventId) {
        const resources = await this.prisma.eventResource.findMany({
            where: { eventId },
        });
        const stats = {
            total: resources.length,
            byType: {},
        };
        resources.forEach((resource) => {
            stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;
        });
        return stats;
    }
};
EventResourceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_upload_service_1.FileUploadService])
], EventResourceService);
exports.EventResourceService = EventResourceService;
//# sourceMappingURL=event-resource.service.js.map