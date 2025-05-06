import { CheckInService } from './check-in.service';
export declare class CheckInController {
    private checkInService;
    constructor(checkInService: CheckInService);
    generateCheckInCode(eventId: string): Promise<{
        id: number;
        createdAt: Date;
        eventId: number;
        code: string;
        used: boolean;
        usedAt: Date;
    }>;
    checkInUser(eventId: string, userId: string, data: {
        code: string;
    }): Promise<{
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
        status: import(".prisma/client").$Enums.RegistrationStatus;
        checkedIn: boolean;
        checkedInAt: Date;
        eventId: number;
        userId: number;
        typeId: number;
        checkInCodeId: number;
    }>;
    getEventCheckIns(eventId: string): Promise<({
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
        status: import(".prisma/client").$Enums.RegistrationStatus;
        checkedIn: boolean;
        checkedInAt: Date;
        eventId: number;
        userId: number;
        typeId: number;
        checkInCodeId: number;
    })[]>;
    getUserCheckIns(userId: string): Promise<({
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
        status: import(".prisma/client").$Enums.RegistrationStatus;
        checkedIn: boolean;
        checkedInAt: Date;
        eventId: number;
        userId: number;
        typeId: number;
        checkInCodeId: number;
    })[]>;
    getEventCheckInStats(eventId: string): Promise<{
        totalRegistrations: number;
        checkedInCount: number;
        checkInRate: number;
    }>;
}
