import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { EventStatus, EventCategory, EventType } from '@prisma/client';
export declare class EventService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    createEvent(title: string, description: string, date: string, organizerId: number, category: EventCategory, type: EventType, status?: EventStatus, location?: string, image?: string, collaboratorIds?: number[]): Promise<{
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
    }>;
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
    getEventById(id: number): Promise<{
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
    updateEvent(id: number, organizerId: number, data: {
        title?: string;
        description?: string;
        date?: string;
        status?: EventStatus;
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
    deleteEvent(id: number, organizerId: number): Promise<{
        message: string;
    }>;
}
