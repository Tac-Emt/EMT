import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';


interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    console.log(`🔍 [JwtStrategy] Validating token for user ID: ${payload.sub}`);


    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, passwordResetAt: true },
    });

    if (!user) {
      console.error(`🚨 [JwtStrategy] User not found for ID: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

  
    if (user.passwordResetAt && payload.iat * 1000 < user.passwordResetAt.getTime()) {
      console.error(`🚨 [JwtStrategy] Token invalidated due to password reset for user ID: ${payload.sub}`);
      throw new UnauthorizedException('Token invalidated due to password reset');
    }

    console.log(`✅ [JwtStrategy] Token validated for user ID: ${payload.sub}`);
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}