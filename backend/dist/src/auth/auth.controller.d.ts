import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Role } from '@prisma/client';
declare class SignupDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
}
declare class LoginDto {
    email: string;
    password: string;
}
declare class VerifyOtpDto {
    email: string;
    otp: string;
}
declare class ForgotPasswordDto {
    email: string;
}
declare class ResetPasswordDto {
    email: string;
    otp: string;
    newPassword: string;
}
export declare class AuthController {
    private authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    signup(body: SignupDto): Promise<{
        message: string;
        otp: string;
    }>;
    getOtp(body: ForgotPasswordDto): Promise<{
        message: string;
        otp: string;
    }>;
    login(body: LoginDto): Promise<{
        accessToken: string;
        role: import(".prisma/client").$Enums.Role;
        userId: number;
        name: string;
    }>;
    verifyOtp(body: VerifyOtpDto): Promise<{
        accessToken: string;
        role: import(".prisma/client").$Enums.Role;
        userId: number;
        name: string;
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        message: string;
        otp: string;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
export {};
