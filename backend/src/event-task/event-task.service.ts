import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

@Injectable()
export class EventTaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(data: {
    eventId: number;
    title: string;
    description?: string;
    assignedTo?: number;
    dueDate?: Date;
    priority?: number;
  }) {
    try {
      return await this.prisma.eventTask.create({
        data: {
          title: data.title,
          description: data.description,
          status: 'PENDING' as TaskStatus,
          dueDate: data.dueDate,
          event: { connect: { id: data.eventId } },
          assignee: data.assignedTo ? { connect: { id: data.assignedTo } } : undefined,
        },
        include: {
          event: true,
          assignee: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create task: ' + error.message);
    }
  }

  async getTask(id: number) {
    const task = await this.prisma.eventTask.findUnique({
      where: { id },
      include: {
        event: true,
        assignee: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getEventTasks(eventId: number, status?: TaskStatus) {
    return this.prisma.eventTask.findMany({
      where: {
        eventId,
        ...(status ? { status } : {}),
      },
      include: {
        assignee: true,
      },
    });
  }

  async getUserTasks(userId: number, status?: TaskStatus) {
    return this.prisma.eventTask.findMany({
      where: {
        assigneeId: userId,
        ...(status ? { status } : {}),
      },
      include: {
        event: true,
      },
    });
  }

  async updateTask(
    id: number,
    data: {
      title?: string;
      description?: string;
      assignedTo?: number;
      dueDate?: Date;
      status?: TaskStatus;
    },
  ) {
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
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Task not found');
      }
      throw new BadRequestException('Failed to update task: ' + error.message);
    }
  }

  async deleteTask(id: number) {
    try {
      await this.prisma.eventTask.delete({
        where: { id },
      });
      return { message: 'Task deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Task not found');
      }
      throw new BadRequestException('Failed to delete task: ' + error.message);
    }
  }

  async getTaskStats(eventId: number) {
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
      // Count by status
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;

      // Count overdue tasks
      if (task.dueDate && task.dueDate < now && task.status !== 'COMPLETED') {
        stats.overdue++;
      }
    });

    return stats;
  }
} 