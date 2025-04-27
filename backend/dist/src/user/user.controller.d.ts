import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getUserProfile(id: string): Promise<{
        message: string;
        data: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getUserEvents(id: string): Promise<{
        message: string;
        data: ({
            organizers: ({
                organizer: {
                    id: number;
                    name: string;
                };
            } & {
                createdAt: Date;
                isHost: boolean;
                pendingConfirmation: boolean;
                expiresAt: Date;
                organizerId: number;
                eventId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            date: Date;
            status: import(".prisma/client").$Enums.EventStatus;
            location: string;
            image: string;
            category: import(".prisma/client").$Enums.EventCategory;
            type: import(".prisma/client").$Enums.EventType;
            eventTag: string;
        })[];
    }>;
}
