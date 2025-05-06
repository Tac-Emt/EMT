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
exports.EventTaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventTaskService = class EventTaskService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTask(data) {
        try {
            return await this.prisma.eventTask.create({
                data: {
                    title: data.title,
                    description: data.description,
                    status: 'PENDING',
                    dueDate: data.dueDate,
                    event: { connect: { id: data.eventId } },
                    assignee: data.assignedTo ? { connect: { id: data.assignedTo } } : undefined,
                },
                include: {
                    event: true,
                    assignee: true,
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create task: ' + error.message);
        }
    }
    async getTask(id) {
        const task = await this.prisma.eventTask.findUnique({
            where: { id },
            include: {
                event: true,
                assignee: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async getEventTasks(eventId, status) {
        return this.prisma.eventTask.findMany({
            where: Object.assign({ eventId }, (status ? { status } : {})),
            include: {
                assignee: true,
            },
        });
    }
    async getUserTasks(userId, status) {
        return this.prisma.eventTask.findMany({
            where: Object.assign({ assigneeId: userId }, (status ? { status } : {})),
            include: {
                event: true,
            },
        });
    }
    async updateTask(id, data) {
        try {
            return await this.prisma.eventTask.update({
                where: { id },
                data: {
                    title: data.title,
                    description: data.description,
                    dueDate: data.dueDate,
                    status: data.status,
                    assignee: data.assignedTo ? { connect: { id: data.assignedTo } } : undefined,
                },
                include: {
                    event: true,
                    assignee: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Task not found');
            }
            throw new common_1.BadRequestException('Failed to update task: ' + error.message);
        }
    }
    async deleteTask(id) {
        try {
            await this.prisma.eventTask.delete({
                where: { id },
            });
            return { message: 'Task deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Task not found');
            }
            throw new common_1.BadRequestException('Failed to delete task: ' + error.message);
        }
    }
    async getTaskStats(eventId) {
        const tasks = await this.prisma.eventTask.findMany({
            where: { eventId },
        });
        const stats = {
            total: tasks.length,
            byStatus: {},
            overdue: 0,
        };
        const now = new Date();
        tasks.forEach((task) => {
            stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
            if (task.dueDate && task.dueDate < now && task.status !== 'COMPLETED') {
                stats.overdue++;
            }
        });
        return stats;
    }
};
EventTaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventTaskService);
exports.EventTaskService = EventTaskService;
//# sourceMappingURL=event-task.service.js.map