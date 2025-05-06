export declare enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
    ORGANIZER = "ORGANIZER",
    SPEAKER = "SPEAKER"
}
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
