import { EventTaskService } from './event-task.service';
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class EventTaskController {
    private readonly eventTaskService;
    constructor(eventTaskService: EventTaskService);
    createTask(data: {
        eventId: number;
        title: string;
        description?: string;
        assignedTo?: number;
        dueDate?: Date;
        priority?: number;
    }): Promise<{
        event: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            date: Date;
            location: string;
            capacity: number;
            status: import(".prisma/client").$Enums.EventStatus;
            image: string;
            agenda: import("@prisma/client/runtime/library").JsonValue;
            resources: import("@prisma/client/runtime/library").JsonValue;
            category: import(".prisma/client").$Enums.EventCategory;
            type: import(".prisma/client").$Enums.EventType;
            eventTag: string;
            registrationLink: string;
            seriesId: number;
            checkedIn: boolean;
            checkedInAt: Date;
            slug: string;
            pageContent: import("@prisma/client/runtime/library").JsonValue;
            pageSettings: import("@prisma/client/runtime/library").JsonValue;
        };
        assignee: {
            id: number;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            otp: string;
            otpExpires: Date;
            passwordResetAt: Date;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            photo: string;
            organization: string;
            title: string;
            socialLinks: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        eventId: number;
        dueDate: Date;
        assigneeId: number;
    }>;
    getTask(id: string): Promise<{
        event: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            date: Date;
            location: string;
            capacity: number;
            status: import(".prisma/client").$Enums.EventStatus;
            image: string;
            agenda: import("@prisma/client/runtime/library").JsonValue;
            resources: import("@prisma/client/runtime/library").JsonValue;
            category: import(".prisma/client").$Enums.EventCategory;
            type: import(".prisma/client").$Enums.EventType;
            eventTag: string;
            registrationLink: string;
            seriesId: number;
            checkedIn: boolean;
            checkedInAt: Date;
            slug: string;
            pageContent: import("@prisma/client/runtime/library").JsonValue;
            pageSettings: import("@prisma/client/runtime/library").JsonValue;
        };
        assignee: {
            id: number;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            otp: string;
            otpExpires: Date;
            passwordResetAt: Date;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            photo: string;
            organization: string;
            title: string;
            socialLinks: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        eventId: number;
        dueDate: Date;
        assigneeId: number;
    }>;
    getEventTasks(eventId: string, status?: TaskStatus): Promise<({
        assignee: {
            id: number;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            otp: string;
            otpExpires: Date;
            passwordResetAt: Date;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            photo: string;
            organization: string;
            title: string;
            socialLinks: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        eventId: number;
        dueDate: Date;
        assigneeId: number;
    })[]>;
    getUserTasks(userId: string, status?: TaskStatus): Promise<({
        event: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            date: Date;
            location: string;
            capacity: number;
            status: import(".prisma/client").$Enums.EventStatus;
            image: string;
            agenda: import("@prisma/client/runtime/library").JsonValue;
            resources: import("@prisma/client/runtime/library").JsonValue;
            category: import(".prisma/client").$Enums.EventCategory;
            type: import(".prisma/client").$Enums.EventType;
            eventTag: string;
            registrationLink: string;
            seriesId: number;
            checkedIn: boolean;
            checkedInAt: Date;
            slug: string;
            pageContent: import("@prisma/client/runtime/library").JsonValue;
            pageSettings: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        eventId: number;
        dueDate: Date;
        assigneeId: number;
    })[]>;
    updateTask(id: string, data: {
        title?: string;
        description?: string;
        assignedTo?: number;
        dueDate?: Date;
        priority?: number;
        status?: TaskStatus;
    }): Promise<{
        event: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            date: Date;
            location: string;
            capacity: number;
            status: import(".prisma/client").$Enums.EventStatus;
            image: string;
            agenda: import("@prisma/client/runtime/library").JsonValue;
            resources: import("@prisma/client/runtime/library").JsonValue;
            category: import(".prisma/client").$Enums.EventCategory;
            type: import(".prisma/client").$Enums.EventType;
            eventTag: string;
            registrationLink: string;
            seriesId: number;
            checkedIn: boolean;
            checkedInAt: Date;
            slug: string;
            pageContent: import("@prisma/client/runtime/library").JsonValue;
            pageSettings: import("@prisma/client/runtime/library").JsonValue;
        };
        assignee: {
            id: number;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            otp: string;
            otpExpires: Date;
            passwordResetAt: Date;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            photo: string;
            organization: string;
            title: string;
            socialLinks: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        eventId: number;
        dueDate: Date;
        assigneeId: number;
    }>;
    deleteTask(id: string): Promise<{
        message: string;
    }>;
    getTaskStats(eventId: string): Promise<{
        total: number;
        byStatus: {};
        overdue: number;
    }>;
}
