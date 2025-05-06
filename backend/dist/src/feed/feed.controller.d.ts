import { FeedService } from './feed.service';
export declare class FeedController {
    private feedService;
    constructor(feedService: FeedService);
    getFeedEvents(organizerIds?: string, categories?: string, types?: string): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
    getFilterOptions(): Promise<{
        message: string;
        data: {
            organizers: {
                id: number;
                name: string;
            }[];
            categories: ("CS" | "RAS" | "IAS" | "WIE")[];
            types: ("CONGRESS" | "CONFERENCE" | "HACKATHON" | "NORMAL" | "ONLINE")[];
        };
    }>;
}
