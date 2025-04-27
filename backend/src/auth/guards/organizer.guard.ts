import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizerGuard implements CanActivate {
  private log(message: string, type: 'INFO' | 'ERROR' | 'SUCCESS') {
    const emojis = {
      INFO: 'ℹ️',
      ERROR: '❌',
      SUCCESS: '✅',
    };
    console.log(`${emojis[type]} [OrganizerGuard] ${message}`);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    this.log(`Incoming request - User: ${user ? JSON.stringify(user) : 'not provided'}`, 'INFO');

    if (!user || !user.role) {
      this.log('No user or role found in request', 'ERROR');
      throw new UnauthorizedException('User or role not found');
    }

    if (user.role !== Role.ORGANIZER) {
      this.log(`Role check failed - Expected: ORGANIZER, Got: ${user.role}`, 'ERROR');
      throw new UnauthorizedException('Only organizers can access this resource');
    }

    this.log('Access granted to organizer', 'SUCCESS');
    return true;
  }
}