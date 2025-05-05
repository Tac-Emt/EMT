import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Admin has access to everything
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Organizer permissions
    if (user.role === Role.ORGANIZER) {
      // Organizers can only manage their own events and view speakers
      if (requiredRoles.includes(Role.ORGANIZER)) {
        const request = context.switchToHttp().getRequest();
        const eventId = request.params.eventId || request.body.eventId;
        
        // If it's an event-related operation, check if the organizer owns the event
        if (eventId) {
          return user.organizedEvents?.some(event => event.id === Number(eventId));
        }
        
        // For speaker-related operations, only allow viewing
        if (request.method === 'GET' && request.path.includes('speakers')) {
          return true;
        }
        
        return false;
      }
    }

    // Speaker permissions
    if (user.role === Role.SPEAKER) {
      // Speakers can only manage their own profile and resources
      if (requiredRoles.includes(Role.SPEAKER)) {
        const request = context.switchToHttp().getRequest();
        const speakerId = request.params.id || request.user.id;
        return user.id === Number(speakerId);
      }
    }

    // User permissions
    if (user.role === Role.USER) {
      // Users can only access their own profile and public resources
      if (requiredRoles.includes(Role.USER)) {
        const request = context.switchToHttp().getRequest();
        const userId = request.params.id || request.user.id;
        return user.id === Number(userId);
      }
    }

    return requiredRoles.some((role) => user.role === role);
  }
} 