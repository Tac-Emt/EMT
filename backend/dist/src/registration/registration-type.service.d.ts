import { PrismaService } from '../prisma/prisma.service';
export declare class RegistrationTypeService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getRegistrationTypes(eventId: number): Promise<{
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
    getRegistrationType(id: number): Promise<{
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
    updateRegistrationType(id: number, data: {
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
    deleteRegistrationType(id: number): Promise<{
        message: string;
    }>;
    checkAvailability(id: number): Promise<{
        available: boolean;
        registered: number;
        capacity: number;
        remaining: number;
    }>;
}
