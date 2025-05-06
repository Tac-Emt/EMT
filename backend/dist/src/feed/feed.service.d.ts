import { PrismaService } from '../prisma/prisma.service';
import { EventCategory, EventType } from '@prisma/client';
export declare class FeedService {
    private prisma;
    constructor(prisma: PrismaService);
    getFeedEvents(organizerIds?: number[], categories?: EventCategory[], types?: EventType[]): Promise<{
        image: string;
        organizers: {
            id: number;
            name: string;
            isHost: boolean;
        }[];
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        date: Date;
        location: string;
        capacity: number;
        status: import(".prisma/client").$Enums.EventStatus;
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
    }[]>;
    getFilterOptions(): Promise<{
        organizers: {
            id: number;
            name: string;
        }[];
        categories: ("CS" | "RAS" | "IAS" | "WIE")[];
        types: ("CONGRESS" | "CONFERENCE" | "HACKATHON" | "NORMAL" | "ONLINE")[];
    }>;
}
