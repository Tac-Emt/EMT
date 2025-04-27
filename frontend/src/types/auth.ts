export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpForm {
  email: string;
  otp: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
  userId?: number;
  name?: string;
  role?: 'USER' | 'ORGANIZER' | 'ADMIN';
  otp?: string; 
}