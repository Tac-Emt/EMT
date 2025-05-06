/// <reference types="multer" />
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EventCategory, EventType } from '@prisma/client';
export declare class AdminController {
    private adminService;
    private userService;
    constructor(adminService: AdminService, userService: UserService);
    getAllUsers(): Promise<{
        message: string;
        data: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    createUser(createUserDto: CreateUserDto): Promise<{
        message: string;
        data: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateUser(id: string, data: {
        email?: string;
        name?: string;
        role?: string;
    }): Promise<{
        message: string;
        data: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getAllEvents(): Promise<{
        message: string;
        data: ({
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
        })[];
    }>;
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
        message: string;
        data: {
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
        };
    }>;
    updateEvent(id: string, file: Express.Multer.File, body: {
        title?: string;
        description?: string;
        date?: string;
        organizerId?: string;
        status?: string;
        location?: string;
        category?: string;
        type?: string;
        existingImageUrl?: string;
        registrationLink?: string;
        pageContent?: any;
        pageSettings?: any;
    }): Promise<{
        message: string;
        data: {
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
        };
    }>;
    deleteEvent(id: string): Promise<{
        message: string;
    }>;
    confirmEventParticipation(id: string, body: {
        confirm: boolean;
        organizerId: string;
    }): Promise<{
        message: string;
        data: any;
    }>;
    private validateEventStatus;
}
