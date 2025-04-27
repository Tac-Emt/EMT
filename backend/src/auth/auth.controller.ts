  import {
    Controller,
    Post,
    Body,
    HttpCode,
    Delete,
    Param,
    UseGuards,
    BadRequestException,
    HttpException,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { UserService } from '../user/user.service';
  import { Role } from '@prisma/client';
  import { JwtAuthGuard } from './jwt-auth.guard';
  import {
    IsEmail,
    IsString,
    MinLength,
    IsOptional,
    IsEnum,
    MaxLength,
  } from 'class-validator';

  // DTOs
  class SignupDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsString({ message: 'Name must be a string' })
    @MinLength(1, { message: 'Name is required' })
    name: string;

    @IsOptional()
    @IsEnum(Role, { message: 'Role must be one of: USER, ORGANIZER, ADMIN' })
    role?: Role;
  }

  class LoginDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
  }

  class VerifyOtpDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString({ message: 'OTP must be a string' })
    @MinLength(6, { message: 'OTP must be 6 digits' })
    @MaxLength(6, { message: 'OTP must be 6 digits' })
    otp: string;
  }

  class ForgotPasswordDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
  }

  class ResetPasswordDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString({ message: 'OTP must be a string' })
    @MinLength(6, { message: 'OTP must be 6 digits' })
    @MaxLength(6, { message: 'OTP must be 6 digits' })
    otp: string;

    @IsString({ message: 'New password must be a string' })
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    newPassword: string;
  }

  @Controller('auth')
  export class AuthController {
    constructor(
      private authService: AuthService,
      private userService: UserService,
    ) {}

    @Post('signup')
    @HttpCode(201)
    async signup(@Body() body: SignupDto) {
      console.log(`🔍 [AuthController] Signup request for email: ${body.email}, name: ${body.name}`);
      try {
        return await this.authService.signup(
          body.email,
          body.password,
          body.name,
          body.role || Role.USER,
        );
      } catch (error) {
        console.error(`🚨 [AuthController] Signup failed: ${error.message}`);
        throw new HttpException(error.message, error.status || 400);
      }
    }

    @Post('get-otp')
    @HttpCode(200)
    async getOtp(@Body() body: ForgotPasswordDto) {
      console.log(`🔍 [AuthController] Get OTP request for email: ${body.email}`);
      try {
        return await this.authService.getOtp(body.email);
      } catch (error) {
        console.error(`🚨 [AuthController] Get OTP failed: ${error.message}`);
        throw new HttpException(error.message, error.status || 400);
      }
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() body: LoginDto) {
      console.log(`🔍 [AuthController] Login request for email: ${body.email}`);
      try {
        return await this.authService.login(body);
      } catch (error) {
        console.error(`🚨 [AuthController] Login failed: ${error.message}`);
        throw new HttpException(error.message, error.status || 400);
      }
    }

    @Post('verify-otp')
    @HttpCode(200)
    async verifyOtp(@Body() body: VerifyOtpDto) {
      console.log(`🔍 [AuthController] Verify OTP request for email: ${body.email}, otp: ${body.otp}`);
      try {
        return await this.authService.verifyOtp(body.email, body.otp);
      } catch (error) {
        console.error(`🚨 [AuthController] Verify OTP failed: ${error.message}`);
        throw new HttpException(error.message, error.status || 400);
      }
    }

    @Post('forgot-password')
    @HttpCode(200)
    async forgotPassword(@Body() body: ForgotPasswordDto) {
      console.log(`🔍 [AuthController] Forgot password request for email: ${body.email}`);
      try {
        return await this.authService.forgotPassword(body.email);
      } catch (error) {
        console.error(`🚨 [AuthController] Forgot password failed: ${error.message}`);
        throw new HttpException(error.message, error.status || 400);
      }
    }

    @Post('reset-password')
    @HttpCode(200)
    async resetPassword(@Body() body: ResetPasswordDto) {
      console.log(`🔍 [AuthController] Reset password request for email: ${body.email}`);
      try {
        return await this.authService.resetPassword(body.email, body.otp, body.newPassword);
      } catch (error) {
        console.error(`🚨 [AuthController] Reset password failed: ${error.message}`);
        throw new HttpException(error.message, error.status || 400);
      }
    }

    @Delete('users/:id')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Param('id') id: string) {
      console.log(`🔍 [AuthController] Delete user request for ID: ${id}`);
      const userId = Number(id);
      if (isNaN(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      try {
        return await this.userService.deleteUser(userId);
      } catch (error) {
        console.error(`🚨 [AuthController] Delete user failed: ${error.message}`);
        throw new HttpException(error.message, error.status || 400);
      }
    }
  }