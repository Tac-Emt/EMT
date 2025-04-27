import { PrismaService } from '../prisma.service';
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
            createdAt: Date;
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
        status: import(".prisma/client").$Enums.EventStatus;
        location: string;
        image: string;
        category: import(".prisma/client").$Enums.EventCategory;
        type: import(".prisma/client").$Enums.EventType;
        eventTag: string;
    })[]>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
}
