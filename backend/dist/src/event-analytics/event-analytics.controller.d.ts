import { EventAnalyticsService } from './event-analytics.service';
export declare class EventAnalyticsController {
    private eventAnalyticsService;
    constructor(eventAnalyticsService: EventAnalyticsService);
    createEventAnalytics(eventId: string): Promise<{
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
    getEventAnalytics(eventId: string): Promise<{
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
    updateEventAnalytics(eventId: string, data: {
        views?: number;
        registrations?: number;
        checkIns?: number;
    }): Promise<{
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
    incrementEventViews(eventId: string): Promise<{
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
    getEventStats(eventId: string): Promise<{
        totalRegistrations: number;
        checkInRate: number;
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
}
