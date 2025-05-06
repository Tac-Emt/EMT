import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { EventStatus, EventCategory, EventType } from '.prisma/client';
export declare class EventService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    createEvent(organizerId: number, data: {
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
        collaboratorIds?: number[];
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
    getOrganizerEvents(organizerId: number, page: number, limit: number): Promise<{
        events: ({
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
        total: number;
        statusBreakdown: (number | import(".prisma/client").$Enums.EventStatus)[][];
        categoryBreakdown: (number | import(".prisma/client").$Enums.EventCategory)[][];
        typeBreakdown: (number | import(".prisma/client").$Enums.EventType)[][];
        upcomingEvents: number;
    }>;
    getEventById(id: number): Promise<{
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
    updateEvent(eventId: number, organizerId: number, data: {
        title?: string;
        description?: string;
        date?: string;
        status?: EventStatus;
        location?: string;
        image?: string;
        category?: EventCategory;
        type?: EventType;
        collaboratorIds?: number[];
        registrationLink?: string;
        pageContent?: any;
        pageSettings?: any;
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
    deleteEvent(id: number, organizerId: number): Promise<{
        message: string;
    }>;
}
