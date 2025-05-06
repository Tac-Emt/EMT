import { SpeakerService } from './speaker.service';
export declare class SpeakerController {
    private speakerService;
    constructor(speakerService: SpeakerService);
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
    getSpeaker(id: string): Promise<{
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
    updateSpeaker(id: string, data: {
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
    deleteSpeaker(id: string): Promise<{
        message: string;
    }>;
    getSpeakerStats(id: string): Promise<{
        totalEvents: number;
    }>;
    getSpeakerEvents(speakerId: number): Promise<{
        message: string;
        data: ({
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
        })[];
    }>;
    getPendingRequests(speakerId: number): Promise<{
        message: string;
        data: ({
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
        })[];
    }>;
    respondToRequest(eventId: string, body: {
        speakerId: number;
        accept: boolean;
    }): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getSpeakerProfile(speakerId: number): Promise<{
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            totalEvents: number;
        };
    }>;
}
