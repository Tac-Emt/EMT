import { SpeakerProfileService } from './speaker-profile.service';
export declare class SpeakerProfileController {
    private speakerProfileService;
    constructor(speakerProfileService: SpeakerProfileService);
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, data: {
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
}
