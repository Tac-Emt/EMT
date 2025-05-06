import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { Role } from '@prisma/client';
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    private generateOtp;
    private validateEmail;
    private validatePassword;
    private validateOtp;
    private validateName;
    private sendEmail;
    signup(email: string, password: string, name: string, role?: Role): Promise<{
        message: string;
        otp: string;
    }>;
    getOtp(email: string): Promise<{
        message: string;
        otp: string;
    }>;
    login({ email, password }: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        role: import(".prisma/client").$Enums.Role;
        userId: number;
        name: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        accessToken: string;
        role: import(".prisma/client").$Enums.Role;
        userId: number;
        name: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        otp: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
}
