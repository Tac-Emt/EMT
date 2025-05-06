import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
export declare class CheckInService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    generateCheckInCode(eventId: number): Promise<{
        id: number;
        createdAt: Date;
        eventId: number;
        code: string;
        used: boolean;
        usedAt: Date;
    }>;
    validateCheckInCode(code: string): Promise<{
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
        eventId: number;
        code: string;
        used: boolean;
        usedAt: Date;
    }>;
    checkInUser(data: {
        eventId: number;
        userId: number;
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
    getEventCheckIns(eventId: number): Promise<({
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
    getUserCheckIns(userId: number): Promise<({
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
    getEventCheckInStats(eventId: number): Promise<{
        totalRegistrations: number;
        checkedInCount: number;
        checkInRate: number;
    }>;
}
