import { PrismaService } from '../prisma/prisma.service';
import { FileUploadService } from '../file-upload/file-upload.service';
export declare class EventResourceService {
    private prisma;
    private fileUploadService;
    constructor(prisma: PrismaService, fileUploadService: FileUploadService);
    createResource(data: {
        eventId: number;
        title: string;
        type: string;
        url: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        type: string;
        eventId: number;
        url: string;
    }>;
    getEventResources(eventId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        type: string;
        eventId: number;
        url: string;
    }[]>;
    getResource(id: number): Promise<{
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
        type: string;
        eventId: number;
        url: string;
    }>;
    updateResource(id: number, data: {
        title?: string;
        type?: string;
        url?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        type: string;
        eventId: number;
        url: string;
    }>;
    deleteResource(id: number): Promise<{
        message: string;
    }>;
    getResourceStats(eventId: number): Promise<{
        total: number;
        byType: {};
    }>;
}
