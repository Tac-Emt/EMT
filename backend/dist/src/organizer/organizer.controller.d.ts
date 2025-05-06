import { EventService } from './organizer.service';
declare enum EventStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    CANCELLED = "CANCELLED"
}
declare enum EventCategory {
    CS = "CS",
    RAS = "RAS",
    IAS = "IAS",
    WIE = "WIE"
}
declare enum EventType {
    CONGRESS = "CONGRESS",
    CONFERENCE = "CONFERENCE",
    HACKATHON = "HACKATHON",
    NORMAL = "NORMAL",
    ONLINE = "ONLINE"
}
export declare class EventController {
    private eventService;
    constructor(eventService: EventService);
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
        collaboratorIds?: number[];
        speakerRequests?: {
            speakerId: number;
            topic?: string;
            description?: string;
        }[];
    }, req: any): Promise<{
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
    confirmEventParticipation(req: any, id: string, body: {
        confirm: boolean;
    }): Promise<{
        message: string;
        event: any;
    }>;
    getEvents(req: any, page?: string, limit?: string): Promise<{
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
    getEventById(req: any, id: string): Promise<{
        message: string;
        event: {
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
    updateEvent(id: string, body: {
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
    }, req: any): Promise<{
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
    deleteEvent(req: any, id: string): Promise<{
        message: string;
        details: {
            message: string;
        };
    }>;
    private validateEventStatus;
}
export {};
