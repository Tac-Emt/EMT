import { RegistrationTypeService } from './registration-type.service';
export declare class RegistrationTypeController {
    private registrationTypeService;
    constructor(registrationTypeService: RegistrationTypeService);
    createRegistrationType(data: {
        eventId: number;
        name: string;
        price?: number;
        capacity?: number;
        startDate: Date;
        endDate: Date;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        capacity: number;
        eventId: number;
        price: number;
        startDate: Date;
        endDate: Date;
    }>;
    getRegistrationTypes(eventId: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        capacity: number;
        eventId: number;
        price: number;
        startDate: Date;
        endDate: Date;
    }[]>;
    getRegistrationType(id: string): Promise<{
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        capacity: number;
        eventId: number;
        price: number;
        startDate: Date;
        endDate: Date;
    }>;
    updateRegistrationType(id: string, data: {
        name?: string;
        price?: number;
        capacity?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        capacity: number;
        eventId: number;
        price: number;
        startDate: Date;
        endDate: Date;
    }>;
    deleteRegistrationType(id: string): Promise<{
        message: string;
    }>;
    checkAvailability(id: string): Promise<{
        available: boolean;
        registered: number;
        capacity: number;
        remaining: number;
    }>;
}
