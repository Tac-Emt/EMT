import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { Role } from '../auth/decorators/roles.decorator';
import { EventStatus, EventCategory, EventType } from '@prisma/client';
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
        role?: Role;
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
    createEvent(data: {
        title: string;
        description?: string;
        date: string;
        location?: string;
        image?: string;
        category: EventCategory;
        type: EventType;
        eventTag: string;
        registrationLink?: string;
        pageContent?: any;
        pageSettings?: any;
        organizerIds: number[];
        speakerRequests?: {
            speakerId: number;
            topic?: string;
            description?: string;
        }[];
    }): Promise<{
        organizers: ({
            organizer: {
                id: number;
                email: string;
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
        speakers: ({
            speaker: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SpeakerStatus;
            eventId: number;
            speakerId: number;
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
    }>;
    private generateSlug;
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
        registrationLink?: string;
        pageContent?: any;
        pageSettings?: any;
    }): Promise<{
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
    }>;
    deleteEvent(id: number): Promise<{
        message: string;
    }>;
}
