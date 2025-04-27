/// <reference types="multer" />
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AdminController {
    private adminService;
    private userService;
    constructor(adminService: AdminService, userService: UserService);
    getAllUsers(): Promise<{
        message: string;
        data: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    createUser(createUserDto: CreateUserDto): Promise<{
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
    updateUser(id: string, data: {
        email?: string;
        name?: string;
        role?: string;
    }): Promise<{
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
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getAllEvents(): Promise<{
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
    createEvent(file: Express.Multer.File, body: {
        title: string;
        description?: string;
        date: string;
        organizerId: string;
        collaboratorIds?: string;
        status?: string;
        location?: string;
        category: string;
        type: string;
        existingImageUrl?: string;
    }): Promise<{
        message: string;
        data: {
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
        };
    }>;
    updateEvent(id: string, file: Express.Multer.File, body: {
        title?: string;
        description?: string;
        date?: string;
        organizerId?: string;
        status?: string;
        location?: string;
        category?: string;
        type?: string;
        existingImageUrl?: string;
    }): Promise<{
        message: string;
        data: {
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
        };
    }>;
    deleteEvent(id: string): Promise<{
        message: string;
    }>;
    confirmEventParticipation(id: string, body: {
        confirm: boolean;
        organizerId: string;
    }): Promise<{
        message: string;
        data: any;
    }>;
    private validateEventStatus;
}
