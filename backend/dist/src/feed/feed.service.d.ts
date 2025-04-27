import { PrismaService } from '../prisma.service';
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
        status: import(".prisma/client").$Enums.EventStatus;
        location: string;
        category: import(".prisma/client").$Enums.EventCategory;
        type: import(".prisma/client").$Enums.EventType;
        eventTag: string;
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
