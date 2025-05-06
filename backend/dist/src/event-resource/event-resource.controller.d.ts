import { EventResourceService } from './event-resource.service';
export declare class EventResourceController {
    private eventResourceService;
    constructor(eventResourceService: EventResourceService);
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
    getEventResources(eventId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        type: string;
        eventId: number;
        url: string;
    }[]>;
    getResource(id: string): Promise<{
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
    updateResource(id: string, data: {
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
    deleteResource(id: string): Promise<{
        message: string;
    }>;
    getResourceStats(eventId: string): Promise<{
        total: number;
        byType: {};
    }>;
}
