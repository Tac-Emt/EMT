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
            status: import(".prisma/client").$Enums.EventStatus;
            location: string;
            category: import(".prisma/client").$Enums.EventCategory;
            type: import(".prisma/client").$Enums.EventType;
            eventTag: string;
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
