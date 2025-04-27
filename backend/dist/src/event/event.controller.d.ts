/// <reference types="multer" />
import { EventService } from './event.service';
export declare class EventController {
    private eventService;
    constructor(eventService: EventService);
    createEvent(req: any, file: Express.Multer.File, body: {
        title: string;
        description?: string;
        date: string;
        status?: string;
        location?: string;
        category: string;
        type: string;
        collaboratorIds?: string;
        existingImageUrl?: string;
    }): Promise<{
        message: string;
        event: {
            organizers: ({
                organizer: {
                    id: number;
                    email: string;
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
        };
    }>;
    updateEvent(req: any, id: string, file: Express.Multer.File, body: {
        title?: string;
        description?: string;
        date?: string;
        status?: string;
        location?: string;
        category?: string;
        type?: string;
        existingImageUrl?: string;
    }): Promise<{
        message: string;
        event: {
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
        };
    }>;
    deleteEvent(req: any, id: string): Promise<{
        message: string;
        details: {
            message: string;
        };
    }>;
    private validateEventStatus;
}
