import { apiClient } from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  OTPVerificationRequest,
} from '../types/auth.types';

export const authService = {
  // apiClient.post<T> returns the inner `data` payload (response.data.data),
  // so the service should expose the inner shape: AuthResponse['data']
  async login(data: LoginRequest): Promise<AuthResponse['data']> {
    console.log('authService.login request:', { url: '/auth/login', data });
    const res = await apiClient.post<AuthResponse['data']>('/auth/login', data);
    console.log('authService.login response:', res);
    return res;
  },

  async register(data: RegisterRequest): Promise<AuthResponse['data']> {
    console.log('authService.register request:', { url: '/auth/register', data });
    const res = await apiClient.post<AuthResponse['data']>('/auth/register', data);
    console.log('authService.register response:', res);
    return res;
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  async verifyToken(): Promise<User> {
    return apiClient.get<User>('/user/me');
  },

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', data);
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return apiClient.post<void>('/auth/forgot-password', data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    return apiClient.post<void>('/auth/reset-password', data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return apiClient.post<void>('/auth/change-password', data);
  },

  async verifyOTP(data: OTPVerificationRequest): Promise<void> {
    return apiClient.post<void>('/auth/verify-otp', data);
  },

  async resendOTP(type: 'email' | 'phone'): Promise<void> {
    return apiClient.post<void>('/auth/resend-otp', { type });
  },

  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>('/auth/account');
  },
};
