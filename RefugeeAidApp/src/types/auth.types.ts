export interface User {
  id: string;
  _id?: string; // MongoDB ID fallback
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  role: UserRole;
  profile: UserProfile;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'user' | 'admin' | 'staff' | 'volunteer';

export type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'rejected' | 'expired';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  languagePreference: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  privacy: {
    shareLocation: boolean;
    shareProfile: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  acceptedTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
    user: User;
  };
  message?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OTPVerificationRequest {
  code: string;
  type: 'email' | 'phone';
}
