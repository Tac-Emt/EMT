import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class OrganizerGuard implements CanActivate {
    private log;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
