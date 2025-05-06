import { PrismaService } from '../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserById(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserEvents(id: number): Promise<({
        organizers: ({
            organizer: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isHost: boolean;
            pendingConfirmation: boolean;
            expiresAt: Date;
            organizerId: number;
            eventId: number;
        })[];
    } & {
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
    })[]>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
}
