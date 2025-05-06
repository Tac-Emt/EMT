import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
export declare enum SpeakerStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}
export declare class SpeakerService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    createSpeaker(data: {
        name: string;
        email: string;
        bio?: string;
        photo?: string;
        organization?: string;
        title?: string;
        socialLinks?: {
            linkedin?: string;
            twitter?: string;
            website?: string;
        };
    }): Promise<{
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
    }>;
    getSpeakers(): Promise<({
        _count: {
            speakerEvents: number;
        };
    } & {
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
    })[]>;
    getSpeaker(id: number): Promise<{
        speakerEvents: ({
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
            status: import(".prisma/client").$Enums.SpeakerStatus;
            eventId: number;
            speakerId: number;
        })[];
    } & {
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
    }>;
    updateSpeaker(id: number, data: {
        name?: string;
        email?: string;
        bio?: string;
        photo?: string;
        organization?: string;
        title?: string;
        socialLinks?: {
            linkedin?: string;
            twitter?: string;
            website?: string;
        };
    }): Promise<{
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
    }>;
    deleteSpeaker(id: number): Promise<{
        message: string;
    }>;
    getSpeakerStats(id: number): Promise<{
        totalEvents: number;
    }>;
    getSpeakerEvents(speakerId: number): Promise<({
        event: {
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
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SpeakerStatus;
        eventId: number;
        speakerId: number;
    })[]>;
    getPendingRequests(speakerId: number): Promise<({
        event: {
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
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SpeakerStatus;
        eventId: number;
        speakerId: number;
    })[]>;
    respondToRequest(eventId: number, speakerId: number, accept: boolean): Promise<{
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
        status: import(".prisma/client").$Enums.SpeakerStatus;
        eventId: number;
        speakerId: number;
    }>;
    getSpeakerProfile(speakerId: number): Promise<{
        id: number;
        name: string;
        email: string;
        totalEvents: number;
    }>;
}
