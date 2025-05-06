import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';


const OTP_EXPIRY_MS = 10 * 60 * 1000; 
const MIN_PASSWORD_LENGTH = 8;
const OTP_LENGTH = 6;

const EMAIL_SUBJECTS = {
  SIGNUP_OTP: '🎉 Your Event Toolbox OTP is Here!',
  WELCOME: '🎊 Welcome to Event Toolbox',
  RESET_OTP: '🔑 Reset Your Event Toolbox Password',
  RESET_CONFIRM: '🎉 Password Reset Successful!',
};

const ERROR_MESSAGES = {
  EMAIL_INVALID: 'Invalid email format',
  EMAIL_EXISTS: 'Email already exists and is verified',
  EMAIL_PENDING: 'Email has a pending verification. Please verify your OTP or wait for it to expire.',
  EMAIL_NOT_FOUND: 'User not found or email not verified',
  OTP_INVALID: 'Invalid or expired OTP',
  OTP_NOT_FOUND: 'No pending OTP found for this email',
  OTP_EXPIRED: 'OTP has expired. Please sign up again.',
  PASSWORD_INVALID: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
  CREDENTIALS_INVALID: 'Invalid credentials or email not verified',
  SIGNUP_FAILED: 'Signup failed. Please try again.',
  LOGIN_FAILED: 'Login failed. Please try again.',
  OTP_VERIFY_FAILED: 'OTP verification failed.',
  RESET_FAILED: 'Password reset failed.',
  EMAIL_SEND_FAILED: 'Failed to send email. Please try again.',
  NAME_REQUIRED: 'Name is required',
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private generateOtp(): { otp: string; otpExpires: Date } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    return { otp, otpExpires };
  }

  private validateEmail(email: string): void {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error(`🚨 [AuthService] Invalid email format: ${email}`);
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_INVALID);
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      console.error(`🚨 [AuthService] Invalid password length: ${password ? password.length : 'undefined'}`);
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_INVALID);
    }
  }

  private validateOtp(otp: string): void {
    if (!otp || otp.length !== OTP_LENGTH) {
      console.error(`🚨 [AuthService] Invalid OTP format: ${otp}`);
      throw new BadRequestException(ERROR_MESSAGES.OTP_INVALID);
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      console.error(`🚨 [AuthService] Name is required but was: ${name}`);
      throw new BadRequestException(ERROR_MESSAGES.NAME_REQUIRED);
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
    context: string,
  ): Promise<void> {
    try {
      console.log(`🔍 [AuthService] Sending ${context} email to: ${to}`);
      await this.emailService.sendMail({ to, subject, text, html });
      console.log(`✅ [AuthService] ${context} email sent successfully to: ${to}`);
    } catch (error) {
      console.error(`🚨 [AuthService] Failed to send ${context} email: ${error.message}`);
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_SEND_FAILED);
    }
  }

  async signup(email: string, password: string, name: string, role: Role = Role.USER) {
    try {
      console.log(`🔍 [AuthService] Starting signup for email: ${email}, name: ${name}`);
      this.validateEmail(email);
      this.validatePassword(password);
      this.validateName(name);

      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      console.log(`🔍 [AuthService] Existing user check: ${existingUser ? 'found' : 'not found'}`);

      if (existingUser) {
        if (!existingUser.isEmailVerified && existingUser.otpExpires && existingUser.otpExpires < new Date()) {
          console.log(`🔍 [AuthService] Deleting unverified user with expired OTP: ${email}`);
          await this.prisma.user.delete({ where: { email } });
        } else if (existingUser.isEmailVerified) {
          console.error(`🚨 [AuthService] Email already exists and is verified: ${email}`);
          throw new BadRequestException(ERROR_MESSAGES.EMAIL_EXISTS);
        } else {
          console.error(`🚨 [AuthService] Email has a pending verification: ${email}`);
          throw new BadRequestException(ERROR_MESSAGES.EMAIL_PENDING);
        }
      }

      console.log(`🔍 [AuthService] Hashing password for email: ${email}`);
      const hashedPassword = await bcrypt.hash(password, 10);

      const { otp, otpExpires } = this.generateOtp();
      console.log(`🔍 [AuthService] Generated OTP: ${otp}, Expires at: ${otpExpires}`);

      console.log(`🔍 [AuthService] Creating user in database for email: ${email}`);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name.trim(),
          role,
          otp,
          otpExpires,
          isEmailVerified: false,
        },
      });
      console.log(`✅ [AuthService] User created successfully: ${user.email}`);

      const otpText = `Hey ${user.name},\n\nGet ready to unlock the magic of Event Toolbox! Your one-time passcode (OTP) is: ${otp}. Use it within 10 minutes to join the party!\n\nHappy planning,\nThe Event Toolbox Team`;
      const otpHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 640px; margin: 40px auto; background-color: #FFFFFF; border: 2px solid #00D4FF; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,212,255,0.2), inset 0 0 10px rgba(255,215,0,0.3);">
          <div style="background: linear-gradient(135deg, #1A1A40 0%, #0D0D2B 100%); padding: 50px 20px 80px; text-align: center; position: relative; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMC41IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+');">
            <div style="position: absolute; bottom: -30px; left: 0; right: 0; height: 30px; background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDEwMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAzMEMyMCAtOC4yMTA1ZS0wNyA0MCAzMCA2MCAzMCA4MCAwIDEwMCAzMCIgZmlsbD0iI0Y4RkFGRiIvPjxwb2x5Z29uIHBvaW50cz0iMCwzMCAyMCwyNSAzMCwzMCA0MCwyNSA1MCwzMCA2MCwyNSA3MCQzMCA4MCwyNSA5MCwzMCAxMDAsMjUiIGZpbGw9InVybCgjZ3JhZGllbnQpIiBvcGFjaXR5PSIwLjUiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGMDA4QiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwRDRGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==') no-repeat center bottom;"></div>
            <img src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg" alt="IEEE Tunisia Section Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(0,212,255,0.5));">
          </div>
          <div style="padding: 50px 40px; text-align: center; background-color: #F8FAFF; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZXgiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNy4zMiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVybuV0cmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwb2x5Z29uIHBvaW50cz0iMTAsMC4wIDE3LjMyLDQuOTkgMTcuMzIsMTIuMzMgMTAsMTcuMzIgMi42OCwxMi4zMyAyLjY4LDQuOTkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRDRGRiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoZXgpIi8+PC9zdmc+');">
            <h1 style="color: #FF073A; font-size: 32px; margin: 0 0 25px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255,7,58,0.5); position: relative;">IGNITE YOUR <span style="text-transform: uppercase; transform: skewX(-5deg); display: inline-block;">IEEE</span> JOURNEY!<span style="content: ''; position: absolute; top: -10px; right: -10px; width: 12px; height: 12px; background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBkPSJNNS41LDQuMUEuOC44LDAsMCwxLDYuNiw0LjguOC44LDAsMCwxLDYsNi4zLjguOCwwLDAsMSw0LjksNS42LjguOCwwLDAsMSw1LjUsNC4xWk02LDkuM2MtMi4yLDAtNC0xLjctNC00czEuOC00LDQtNHM0LDEuNyw0LDRTOS4yLDkuMyw2LDkuM1oiIGZpbGw9IiNGRjAwOEIiLz48L3N2Zz4=') no-repeat; z-index: 1;"></span></h1>
            <p style="color: #333333; font-size: 18px; line-height: 1.8; margin: 0 0 30px;">Greetings <strong>${user.name}</strong>, step into the <span style="text-transform: uppercase; color: #00D4FF;">IEEE Tunisia Section Event Toolbox</span>! Activate your account with this cosmic code:</p>
            <div style="display: inline-block; background: linear-gradient(135deg, #FFFFFF, #E6E6FA); border: 3px solid transparent; border-image: linear-gradient(135deg, #00D4FF, #FF073A) 1; border-radius: 12px; padding: 20px 40px; margin: 30px 0; font-size: 36px; font-weight: 900; color: #000000; letter-spacing: 4px; box-shadow: 0 6px 16px rgba(0,212,255,0.4), inset 0 0 8px rgba(255,215,0,0.2); background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJjaXJjdWl0IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0wLDEwTDEwLDEwTDEwLDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRDRGRiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMiIvPjxwYXRoIGQ9Ik0xMCwxMEwxMCwyMEwxNSwyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkYwMDhCIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NpcmN1aXQpIi8+PC9zdmc+'); transition: transform 0.2s ease;">${otp}</div>
            <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">Enter this code within 10 minutes to launch your creative orbit.</p>
            <p style="color: #666666; font-size: 14px; margin: 20px 0 0;">Not your mission? Let this signal drift into the void.</p>
          </div>
          <div style="height: 6px; background: linear-gradient(90deg, #FF073A, #00D4FF); box-shadow: 0 0 10px rgba(255,7,58,0.5);"></div>
          <div style="padding: 30px; text-align: center; background-color: #FFFFFF;">
            <p style="color: #1A1A40; font-size: 16px; margin: 0 0 15px; font-weight: 600;">IEEE Tunisia Section Event Toolbox</p>
            <p style="margin: 0;">
              <a href="https://ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Explore IEEE<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a> |
              <a href="mailto:support@ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Get Support<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a>
            </p>
            <p style="color: #999999; font-size: 13px; margin: 15px 0 0;">© 2025 IEEE Tunisia Section. Powered by Cosmic Innovation.</p>
          </div>
        </div>
      `;

      await this.sendEmail(email, EMAIL_SUBJECTS.SIGNUP_OTP, otpText, otpHtml, 'OTP');

      console.log(`✅ [AuthService] Signup successful for email: ${email}`);
      return {
        message: 'User registered. Verify your OTP.',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      };
    } catch (error) {
      console.error(`🚨 [AuthService] Error during signup: ${error.message}`);
      throw new BadRequestException(error.message || ERROR_MESSAGES.SIGNUP_FAILED);
    }
  }

  async getOtp(email: string) {
    try {
      console.log(`🔍 [AuthService] Retrieving OTP for email: ${email}`);
      this.validateEmail(email);

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`🚨 [AuthService] User not found for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_NOT_FOUND);
      }
      if (user.isEmailVerified) {
        console.error(`🚨 [AuthService] Email already verified: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.OTP_NOT_FOUND);
      }
      if (user.otpExpires && user.otpExpires < new Date()) {
        console.error(`🚨 [AuthService] OTP expired for email: ${email}`);
        await this.prisma.user.delete({ where: { email } });
        throw new BadRequestException(ERROR_MESSAGES.OTP_EXPIRED);
      }
      console.log(`✅ [AuthService] OTP retrieved for email: ${email}`);
      return {
        message: 'OTP retrieved successfully.',
        otp: process.env.NODE_ENV === 'development' ? user.otp : undefined,
      };
    } catch (error) {
      console.error(`🚨 [AuthService] Error retrieving OTP: ${error.message}`);
      throw new BadRequestException(error.message || ERROR_MESSAGES.OTP_NOT_FOUND);
    }
  }

  async login({ email, password }: { email: string; password: string }) {
    try {
      console.log(`🔍 [AuthService] Starting login for email: ${email}`);
      this.validateEmail(email);
      this.validatePassword(password);

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`🚨 [AuthService] User not found for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_NOT_FOUND);
      }
      if (!user.isEmailVerified) {
        console.error(`🚨 [AuthService] Email not verified: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.CREDENTIALS_INVALID);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.error(`🚨 [AuthService] Invalid password for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.CREDENTIALS_INVALID);
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      console.log(`✅ [AuthService] Login successful for email: ${email}`);
      return {
        accessToken,
        role: user.role,
        userId: user.id,
        name: user.name,
      };
    } catch (error) {
      console.error(`🚨 [AuthService] Error during login: ${error.message}`);
      throw new BadRequestException(error.message || ERROR_MESSAGES.LOGIN_FAILED);
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      console.log(`🔍 [AuthService] Verifying OTP for email: ${email}`);
      this.validateEmail(email);
      this.validateOtp(otp);

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`🚨 [AuthService] User not found for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_NOT_FOUND);
      }
      if (user.isEmailVerified) {
        console.error(`🚨 [AuthService] Email already verified: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.OTP_NOT_FOUND);
      }
      if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
        console.error(`🚨 [AuthService] Invalid or expired OTP for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.OTP_INVALID);
      }

      const updatedUser = await this.prisma.user.update({
        where: { email },
        data: { isEmailVerified: true, otp: null, otpExpires: null },
      });

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      const welcomeText = `Hi ${user.name || 'User'},\n\nWelcome aboard! You're now part of the Event Toolbox family. Start planning unforgettable events today—create, manage, and celebrate with ease!\n\nCheers,\nThe Event Toolbox Team`;
      const welcomeHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 640px; margin: 40px auto; background-color: #FFFFFF; border: 2px solid #00D4FF; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,212,255,0.2), inset 0 0 10px rgba(255,215,0,0.3);">
          <div style="background: linear-gradient(135deg, #1A1A40 0%, #0D0D2B 100%); padding: 50px 20px 80px; text-align: center; position: relative; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMC41IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+');">
            <div style="position: absolute; bottom: -30px; left: 0; right: 0; height: 30px; background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDEwMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAzMEMyMCAtOC4yMTA1ZS0wNyA0MCAzMCA2MCAzMCA4MCAwIDEwMCAzMCIgZmlsbD0iI0Y4RkFGRiIvPjxwb2x5Z29uIHBvaW50cz0iMCwzMCAyMCwyNSAzMCwzMCA0MCwyNSA1MCwzMCA2MCwyNSA3MCQzMCA4MCwyNSA5MCwzMCAxMDAsMjUiIGZpbGw9InVybCgjZ3JhZGllbnQpIiBvcGFjaXR5PSIwLjUiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGMDA4QiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwRDRGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==') no-repeat center bottom;"></div>
            <img src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg" alt="IEEE Tunisia Section Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(0,212,255,0.5));">
          </div>
          <div style="padding: 50px 40px; text-align: center; background-color: #F8FAFF; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZXgiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNy4zMiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVybuV0cmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwb2x5Z29uIHBvaW50cz0iMTAsMC4wIDE3LjMyLDQuOTkgMTcuMzIsMTIuMzMgMTAsMTcuMzIgMi42OCwxMi4zMyAyLjY4LDQuOTkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRDRGRiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoZXgpIi8+PC9zdmc+');">
            <h1 style="color: #FF073A; font-size: 32px; margin: 0 0 25px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255,7,58,0.5); position: relative;">YOU'RE PART OF THE <span style="text-transform: uppercase; transform: skewX(-5deg); display: inline-block;">VISION</span>, ${user.name || 'User'}!<span style="content: ''; position: absolute; top: -10px; right: -10px; width: 12px; height: 12px; background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBkPSJNNS41LDQuMUEuOC44LDAsMCwxLDYuNiw0LjguOC44LDAsMCwxLDYsNi4zLjguOCwwLDAsMSw0LjksNS42LjguOCwwLDAsMSw1LjUsNC4xWk02LDkuM2MtMi4yLDAtNC0xLjctNC00czEuOC00LDQtNHM0LDEuNyw0LDRTOS4yLDkuMyw6LDkuM1oiIGZpbGw9IiNGRjAwOEIiLz48L3N2Zz4=') no-repeat; z-index: 1;"></span></h1>
            <p style="color: #333333; font-size: 18px; line-height: 1.8; margin: 0 0 30px;">Welcome to the <span style="text-transform: uppercase; color: #00D4FF;">IEEE Tunisia Section Event Toolbox</span>! 🎇 Your mission to craft stellar events begins now.</p>
            <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">Explore cosmic gatherings or spark your own creations in our electrified community.</p>
            <p style="color: #666666; font-size: 14px; margin: 20px 0 0;">Need a star map? We're just a signal away!</p>
          </div>
          <div style="height: 6px; background: linear-gradient(90deg, #FF073A, #00D4FF); box-shadow: 0 0 10px rgba(255,7,58,0.5);"></div>
          <div style="padding: 30px; text-align: center; background-color: #FFFFFF;">
            <p style="color: #1A1A40; font-size: 16px; margin: 0 0 15px; font-weight: 600;">IEEE Tunisia Section Event Toolbox</p>
            <p style="margin: 0;">
              <a href="https://ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Explore IEEE<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a> |
              <a href="mailto:support@ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Get Support<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a>
            </p>
            <p style="color: #999999; font-size: 13px; margin: 15px 0 0;">© 2025 IEEE Tunisia Section. Powered by Cosmic Innovation.</p>
          </div>
        </div>
      `;

      await this.sendEmail(
        email,
        `${EMAIL_SUBJECTS.WELCOME}, ${user.name || 'User'}!`,
        welcomeText,
        welcomeHtml,
        'welcome',
      );

      console.log(`✅ [AuthService] OTP verified for email: ${email}`);
      return {
        accessToken,
        role: updatedUser.role,
        userId: updatedUser.id,
        name: updatedUser.name,
      };
    } catch (error) {
      console.error(`🚨 [AuthService] Error during OTP verification: ${error.message}`);
      throw new BadRequestException(error.message || ERROR_MESSAGES.OTP_VERIFY_FAILED);
    }
  }

  async forgotPassword(email: string) {
    try {
      console.log(`🔍 [AuthService] Initiating password reset for email: ${email}`);
      this.validateEmail(email);

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`🚨 [AuthService] User not found for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_NOT_FOUND);
      }
      if (!user.isEmailVerified) {
        console.error(`🚨 [AuthService] Email not verified: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_NOT_FOUND);
      }

      const { otp, otpExpires } = this.generateOtp();
      console.log(`🔍 [AuthService] Generated OTP for password reset: ${otp}, Expires at: ${otpExpires}`);

      await this.prisma.user.update({
        where: { email },
        data: { otp, otpExpires },
      });
      console.log(`✅ [AuthService] User updated with reset OTP for email: ${email}`);

      const resetText = `Hi ${user.name || 'User'},\n\nForgot your password? No worries! Use this OTP to reset it: ${otp}. It expires in 10 minutes.\n\nBest,\nThe Event Toolbox Team`;
      const resetHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 640px; margin: 40px auto; background-color: #FFFFFF; border: 2px solid #00D4FF; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,212,255,0.2), inset 0 0 10px rgba(255,215,0,0.3);">
          <div style="background: linear-gradient(135deg, #1A1A40 0%, #0D0D2B 100%); padding: 50px 20px 80px; text-align: center; position: relative; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMC41IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+');">
            <div style="position: absolute; bottom: -30px; left: 0; right: 0; height: 30px; background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDEwMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAzMEMyMCAtOC4yMTA1ZS0wNyA0MCAzMCA2MCAzMCA4MCAwIDEwMCAzMCIgZmlsbD0iI0Y4RkFGRiIvPjxwb2x5Z29uIHBvaW50cz0iMCwzMCAyMCwyNSAzMCwzMCA0MCwyNSA1MCwzMCA2MCwyNSA3MCQzMCA4MCwyNSA5MCwzMCAxMDAsMjUiIGZpbGw9InVybCgjZ3JhZGllbnQpIiBvcGFjaXR5PSIwLjUiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGMDA4QiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwRDRGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==') no-repeat center bottom;"></div>
            <img src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg" alt="IEEE Tunisia Section Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(0,212,255,0.5));">
          </div>
          <div style="padding: 50px 40px; text-align: center; background-color: #F8FAFF; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZXgiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNy4zMiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVybuV0cmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwb2x5Z29uIHBvaW50cz0iMTAsMC4wIDE3LjMyLDQuOTkgMTcuMzIsMTIuMzMgMTAsMTcuMzIgMi42OCwxMi4zMyAyLjY4LDQuOTkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRDRGRiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoZXgpIi8+PC9zdmc+');">
            <h1 style="color: #FF073A; font-size: 32px; margin: 0 0 25px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255,7,58,0.5); position: relative;">RESET YOUR <span style="text-transform: uppercase; transform: skewX(-5deg); display: inline-block;">CREATIVE</span> KEY!<span style="content: ''; position: absolute; top: -10px; right: -10px; width: 12px; height: 12px; background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBkPSJNNS41LDQuMUEuOC44LDAsMCwxLDYuNiw0LjguOC44LDAsMCwxLDYsNi4zLjguOCwwLDAsMSw0LjksNS42LjguOCwwLDAsMSw1LjUsNC4xWk02LDkuM2MtMi4yLDAtNC0xLjctNC00czEuOC00LDQtNHM0LDEuNyw0LDRTOS4yLDkuMyw6LDkuM1oiIGZpbGw9IiNGRjAwOEIiLz48L3N2Zz4=') no-repeat; z-index: 1;"></span></h1>
            <p style="color: #333333; font-size: 18px; line-height: 1.8; margin: 0 0 30px;">Hi <strong>${user.name || 'User'}</strong>, lost your access? Use this code to reconnect with the <span style="text-transform: uppercase; color: #00D4FF;">IEEE Tunisia Section Event Toolbox</span>:</p>
            <div style="display: inline-block; background: linear-gradient(135deg, #FFFFFF, #E6E6FA); border: 3px solid transparent; border-image: linear-gradient(135deg, #00D4FF, #FF073A) 1; border-radius: 12px; padding: 20px 40px; margin: 30px 0; font-size: 36px; font-weight: 900; color: #000000; letter-spacing: 4px; box-shadow: 0 6px 16px rgba(0,212,255,0.4), inset 0 0 8px rgba(255,215,0,0.2); background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJjaXJjdWl0IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0wLDEwTDEwLDEwTDEwLDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRDRGRiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMiIvPjxwYXRoIGQ9Ik0xMCwxMEwxMCwyMEwxNSwyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkYwMDhCIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NpcmN1aXQpIi8+PC9zdmc+'); transition: transform 0.2s ease;">${otp}</div>
            <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">This code expires in 10 minutes—move at lightspeed!</p>
            <p style="color: #666666; font-size: 14px; margin: 20px 0 0;">Not your request? Ignore this to keep your orbit secure.</p>
          </div>
          <div style="height: 6px; background: linear-gradient(90deg, #FF073A, #00D4FF); box-shadow: 0 0 10px rgba(255,7,58,0.5);"></div>
          <div style="padding: 30px; text-align: center; background-color: #FFFFFF;">
            <p style="color: #1A1A40; font-size: 16px; margin: 0 0 15px; font-weight: 600;">IEEE Tunisia Section Event Toolbox</p>
            <p style="margin: 0;">
              <a href="https://ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Explore IEEE<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a> |
              <a href="mailto:support@ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Get Support<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a>
            </p>
            <p style="color: #999999; font-size: 13px; margin: 15px 0 0;">© 2025 IEEE Tunisia Section. Powered by Cosmic Innovation.</p>
          </div>
        </div>
      `;

      await this.sendEmail(email, EMAIL_SUBJECTS.RESET_OTP, resetText, resetHtml, 'password reset OTP');

      console.log(`✅ [AuthService] Password reset OTP sent for email: ${email}`);
      return {
        message: 'Password reset OTP sent. Check your email.',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      };
    } catch (error) {
      console.error(`🚨 [AuthService] Error during forgot password: ${error.message}`);
      throw new BadRequestException(error.message || ERROR_MESSAGES.RESET_FAILED);
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    try {
      console.log(`🔍 [AuthService] Resetting password for email: ${email}`);
      this.validateEmail(email);
      this.validateOtp(otp);
      this.validatePassword(newPassword);

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`🚨 [AuthService] User not found for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_NOT_FOUND);
      }
      if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
        console.error(`🚨 [AuthService] Invalid or expired OTP for email: ${email}`);
        throw new BadRequestException(ERROR_MESSAGES.OTP_INVALID);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log(`🔍 [AuthService] Hashed new password for email: ${email}`);

      await this.prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          otp: null,
          otpExpires: null,
        },
      });
      console.log(`✅ [AuthService] Password reset successful for email: ${email}`);

      const confirmText = `Hi ${user.name || 'User'},\n\nYour password has been successfully reset. You're all set to log in now!\n\nBest,\nThe Event Toolbox Team`;
      const confirmHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 640px; margin: 40px auto; background-color: #FFFFFF; border: 2px solid #00D4FF; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,212,255,0.2), inset 0 0 10px rgba(255,215,0,0.3);">
          <div style="background: linear-gradient(135deg, #1A1A40 0%, #0D0D2B 100%); padding: 50px 20px 80px; text-align: center; position: relative; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMC41IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+');">
            <div style="position: absolute; bottom: -30px; left: 0; right: 0; height: 30px; background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDEwMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAzMEMyMCAtOC4yMTA1ZS0wNyA0MCAzMCA2MCAzMCA4MCAwIDEwMCAzMCIgZmlsbD0iI0Y4RkFGRiIvPjxwb2x5Z29uIHBvaW50cz0iMCwzMCAyMCwyNSAzMCwzMCA0MCwyNSA1MCQzMCA2MCwyNSA3MCQzMCA4MCwyNSA5MCwzMCAxMDAsMjUiIGZpbGw9InVybCgjZ3JhZGllbnQpIiBvcGFjaXR5PSIwLjUiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGMDA4QiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwRDRGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==') no-repeat center bottom;"></div>
            <img src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg" alt="IEEE Tunisia Section Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(0,212,255,0.5));">
          </div>
          <div style="padding: 50px 40px; text-align: center; background-color: #F8FAFF; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZXgiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNy4zMiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVybuV0cmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwb2x5Z29uIHBvaW50cz0iMTAsMC4wIDE3LjMyLDQuOTkgMTcuMzIsMTIuMzMgMTAsMTcuMzIgMi42OCwxMi4zMyAyLjY4LDQuOTkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRDRGRiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoZXgpIi8+PC9zdmc+');">
            <h1 style="color: #FF073A; font-size: 32px; margin: 0 0 25px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255,7,58,0.5); position: relative;">PASSWORD <span style="text-transform: uppercase; transform: skewX(-5deg); display: inline-block;">RESET</span> COMPLETE!<span style="content: ''; position: absolute; top: -10px; right: -10px; width: 12px; height: 12px; background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBkPSJNNS41LDQuMUEuOC44LDAsMCwxLDYuNiw0LjguOC44LDAsMCwxLDYsNi4zLjguOCwwLDAsMSw0LjksNS42LjguOCwwLDAsMSw1LjUsNC4xWk02LDkuM2MtMi4yLDAtNC0xLjctNC00czEuOC00LDQtNHM0LDEuNyw0LDRTOS4yLDkuMyw6LDkuM1oiIGZpbGw9IiNGRjAwOEIiLz48L3N2Zz4=') no-repeat; z-index: 1;"></span></h1>
            <p style="color: #333333; font-size: 18px; line-height: 1.8; margin: 0 0 30px;">Hi <strong>${user.name || 'User'}</strong>, your access to the <span style="text-transform: uppercase; color: #00D4FF;">IEEE Tunisia Section Event Toolbox</span> is fully restored.</p>
            <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">Jump back into the cosmos and create electrifying events!</p>
            <p style="color: #666666; font-size: 14px; margin: 20px 0 0;">Not you? Signal us at <a href="mailto:support@ieee.tn" style="color: #00D4FF; text-decoration: none; transition: color 0.3s ease;">support@ieee.tn</a>.</p>
          </div>
          <div style="height: 6px; background: linear-gradient(90deg, #FF073A, #00D4FF); box-shadow: 0 0 10px rgba(255,7,58,0.5);"></div>
          <div style="padding: 30px; text-align: center; background-color: #FFFFFF;">
            <p style="color: #1A1A40; font-size: 16px; margin: 0 0 15px; font-weight: 600;">IEEE Tunisia Section Event Toolbox</p>
            <p style="margin: 0;">
              <a href="https://ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Explore IEEE<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a> |
              <a href="mailto:support@ieee.tn" style="color: #00D4FF; font-size: 15px; text-decoration: none; margin: 0 20px; position: relative; transition: color 0.3s ease;">Get Support<span style="content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #FFD700; transition: width 0.3s ease;"></span></a>
            </p>
            <p style="color: #999999; font-size: 13px; margin: 15px 0 0;">© 2025 IEEE Tunisia Section. Powered by Cosmic Innovation.</p>
          </div>
        </div>
      `;

      await this.sendEmail(email, EMAIL_SUBJECTS.RESET_CONFIRM, confirmText, confirmHtml, 'password reset confirmation');

      console.log(`✅ [AuthService] Password reset successful for email: ${email}`);
      return {
        message: 'Password reset successful. You can now log in with your new password.',
      };
    } catch (error) {
      console.error(`🚨 [AuthService] Error during password reset: ${error.message}`);
      throw new BadRequestException(error.message || ERROR_MESSAGES.RESET_FAILED);
    }
  }
}