import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { EventStatus, EventCategory, EventType, Role } from '@prisma/client';
export declare class AdminService {
    private prisma;
    private userService;
    private emailService;
    constructor(prisma: PrismaService, userService: UserService, emailService: EmailService);
    getAllUsers(): Promise<{
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createUser(email: string, password: string, name: string, role: Role): Promise<{
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: number, data: {
        email?: string;
        name?: string;
        role?: string;
    }): Promise<{
        id: number;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
    getAllEvents(): Promise<({
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
    createEvent(data: {
        title: string;
        description: string;
        date: string;
        status?: EventStatus;
        organizerId: number;
        collaboratorIds?: number[];
        location?: string;
        image?: string;
        category: EventCategory;
        type: EventType;
    }): Promise<{
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
    }>;
    confirmEventParticipation(eventId: number, organizerId: number, confirm: boolean): Promise<{
        message: string;
    }>;
    updateEvent(id: number, data: {
        title?: string;
        description?: string;
        date?: string;
        status?: EventStatus;
        organizerId?: number;
        location?: string;
        image?: string;
        category?: EventCategory;
        type?: EventType;
    }): Promise<{
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
    }>;
    deleteEvent(id: number): Promise<{
        message: string;
    }>;
}
