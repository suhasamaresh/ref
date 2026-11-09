import Constants from 'expo-constants';

// API Configuration
export const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 'http://172.16.13.98:5000/api';
export const API_TIMEOUT = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_TIMEOUT || 15000;

// App Configuration
export const APP_NAME = Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_NAME || 'AI Refugee Aid';
export const APP_VERSION = Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_VERSION || '1.0.0';
export const APP_ENV = Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV || 'development';

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@refugee_aid_token',
  REFRESH_TOKEN: '@refugee_aid_refresh_token',
  USER: '@refugee_aid_user',
  THEME: '@refugee_aid_theme',
  LANGUAGE: '@refugee_aid_language',
  ONBOARDING_COMPLETED: '@refugee_aid_onboarding',
  NOTIFICATIONS: '@refugee_aid_notifications',
  NOTIFICATION_SETTINGS: '@refugee_aid_notification_settings',
  FAVORITES: '@refugee_aid_favorites',
  CACHE: '@refugee_aid_cache',
  SEARCH_HISTORY: '@refugee_aid_search_history',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    AVATAR: '/user/avatar',
    DELETE_ACCOUNT: '/user/account',
  },
  IDENTITY: {
    DOCUMENTS: '/identity/documents',
    UPLOAD: '/identity/upload',
    STATUS: '/identity/status',
    SUBMIT: '/identity/submit',
  },
  RESOURCES: {
    LIST: '/resources',
    SEARCH: '/resources/search',
    FAVORITES: '/resources/favorites',
    RATE: (id: string) => `/resources/${id}/rate`,
    REPORT: (id: string) => `/resources/${id}/report`,
  },
  APPLICATIONS: {
    LIST: '/applications',
    CREATE: '/applications',
    UPDATE: (id: string) => `/applications/${id}`,
    DELETE: (id: string) => `/applications/${id}`,
  },
} as const;

// Document Types
export const DOCUMENT_TYPES = {
  passport: 'Passport',
  national_id: 'National ID',
  birth_certificate: 'Birth Certificate',
  refugee_certificate: 'Refugee Certificate',
  asylum_document: 'Asylum Document',
  driver_license: "Driver's License",
  visa: 'Visa',
  residence_permit: 'Residence Permit',
  work_permit: 'Work Permit',
  health_card: 'Health Card',
  other: 'Other',
} as const;

// Resource Categories
export const RESOURCE_CATEGORIES = {
  housing: 'Housing',
  employment: 'Employment',
  legal: 'Legal Aid',
  healthcare: 'Healthcare',
  education: 'Education',
  food: 'Food Assistance',
  transportation: 'Transportation',
  mental_health: 'Mental Health',
  language_learning: 'Language Learning',
  financial: 'Financial Aid',
  childcare: 'Childcare',
  emergency: 'Emergency Services',
  community: 'Community Support',
  other: 'Other',
} as const;

// Application Types
export const APPLICATION_TYPES = {
  asylum: 'Asylum Application',
  housing: 'Housing Application',
  employment: 'Employment Application',
  healthcare: 'Healthcare Application',
  education: 'Education Application',
  financial_aid: 'Financial Aid Application',
  legal_aid: 'Legal Aid Request',
  family_reunification: 'Family Reunification',
  citizenship: 'Citizenship Application',
  work_permit: 'Work Permit Application',
  other: 'Other Application',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?([\d\s\-()])+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// File Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Screen Breakpoints
export const BREAKPOINTS = {
  SMALL: 320,
  MEDIUM: 768,
  LARGE: 1024,
} as const;
