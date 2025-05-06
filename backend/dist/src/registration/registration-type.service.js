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
exports.RegistrationTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RegistrationTypeService = class RegistrationTypeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRegistrationType(data) {
        return this.prisma.registrationType.create({
            data: {
                name: data.name,
                price: data.price,
                capacity: data.capacity,
                startDate: data.startDate,
                endDate: data.endDate,
                event: { connect: { id: data.eventId } },
            },
        });
    }
    async getRegistrationTypes(eventId) {
        return this.prisma.registrationType.findMany({
            where: { eventId },
        });
    }
    async getRegistrationType(id) {
        const type = await this.prisma.registrationType.findUnique({
            where: { id },
            include: {
                event: true,
            },
        });
        if (!type) {
            throw new common_1.NotFoundException('Registration type not found');
        }
        return type;
    }
    async updateRegistrationType(id, data) {
        const type = await this.prisma.registrationType.findUnique({
            where: { id },
        });
        if (!type) {
            throw new common_1.NotFoundException('Registration type not found');
        }
        return this.prisma.registrationType.update({
            where: { id },
            data,
        });
    }
    async deleteRegistrationType(id) {
        const type = await this.prisma.registrationType.findUnique({
            where: { id },
        });
        if (!type) {
            throw new common_1.NotFoundException('Registration type not found');
        }
        await this.prisma.registrationType.delete({
            where: { id },
        });
        return { message: 'Registration type deleted successfully' };
    }
    async checkAvailability(id) {
        const registrationType = await this.prisma.registrationType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        registrations: true
                    }
                }
            }
        });
        if (!registrationType) {
            throw new common_1.NotFoundException('Registration type not found');
        }
        const registeredCount = registrationType._count.registrations;
        return {
            available: registrationType.capacity ? registeredCount < registrationType.capacity : true,
            registered: registeredCount,
            capacity: registrationType.capacity,
            remaining: registrationType.capacity ? registrationType.capacity - registeredCount : null,
        };
    }
};
RegistrationTypeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegistrationTypeService);
exports.RegistrationTypeService = RegistrationTypeService;
//# sourceMappingURL=registration-type.service.js.map