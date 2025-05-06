import { PrismaService } from '../prisma/prisma.service';
export declare class SpeakerProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    createProfile(data: {
        userId: number;
        bio?: string;
        expertise?: string[];
        website?: string;
        socialLinks?: any;
        availability?: any;
    }): Promise<{
        user: {
            id: number;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            otp: string;
            otpExpires: Date;
            passwordResetAt: Date;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            photo: string;
            organization: string;
            title: string;
            socialLinks: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bio: string;
        userId: number;
        rating: number;
        expertise: string[];
        availability: import("@prisma/client/runtime/library").JsonValue;
        totalRatings: number;
        agreement: string;
        paymentInfo: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getProfile(id: number): Promise<{
        totalEvents: number;
        speakerProfile: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            userId: number;
            rating: number;
            expertise: string[];
            availability: import("@prisma/client/runtime/library").JsonValue;
            totalRatings: number;
            agreement: string;
            paymentInfo: import("@prisma/client/runtime/library").JsonValue;
        };
        _count: {
            speakerEvents: number;
        };
        id: number;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        otp: string;
        otpExpires: Date;
        passwordResetAt: Date;
        createdAt: Date;
        updatedAt: Date;
        bio: string;
        photo: string;
        organization: string;
        title: string;
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getUserProfile(userId: number): Promise<{
        user: {
            id: number;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            otp: string;
            otpExpires: Date;
            passwordResetAt: Date;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            photo: string;
            organization: string;
            title: string;
            socialLinks: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bio: string;
        userId: number;
        rating: number;
        expertise: string[];
        availability: import("@prisma/client/runtime/library").JsonValue;
        totalRatings: number;
        agreement: string;
        paymentInfo: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateProfile(id: number, data: {
        bio?: string;
        photo?: string;
        organization?: string;
        title?: string;
        socialLinks?: {
            linkedin?: string;
            twitter?: string;
            website?: string;
        };
    }): Promise<{
        speakerProfile: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            bio: string;
            userId: number;
            rating: number;
            expertise: string[];
            availability: import("@prisma/client/runtime/library").JsonValue;
            totalRatings: number;
            agreement: string;
            paymentInfo: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: number;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        otp: string;
        otpExpires: Date;
        passwordResetAt: Date;
        createdAt: Date;
        updatedAt: Date;
        bio: string;
        photo: string;
        organization: string;
        title: string;
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteProfile(id: number): Promise<{
        message: string;
    }>;
    getSpeakerEvents(userId: number): Promise<({
        event: {
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
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SpeakerStatus;
        eventId: number;
        speakerId: number;
    })[]>;
    getSpeakerStats(userId: number): Promise<{
        totalEvents: number;
        upcomingEvents: number;
        pastEvents: number;
        averageRating: number;
        totalFeedback: number;
    }>;
}
