import { PrismaService } from '../prisma/prisma.service';
export declare class EventAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    createEventAnalytics(eventId: number): Promise<{
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
    getEventAnalytics(eventId: number): Promise<{
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
    updateEventAnalytics(eventId: number, data: {
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
    incrementEventViews(eventId: number): Promise<{
        id: number;
        registrations: number;
        eventId: number;
        views: number;
        checkIns: number;
        lastUpdated: Date;
    }>;
    getEventStats(eventId: number): Promise<{
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
