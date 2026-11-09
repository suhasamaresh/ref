import * as Yup from 'yup';
import { REGEX_PATTERNS } from './constants';

// Common validation schemas
export const emailValidation = Yup.string()
  .matches(REGEX_PATTERNS.EMAIL, 'Please enter a valid email address')
  .required('Email is required');

export const passwordValidation = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  // Complexity requirement removed for now (uppercase/lowercase/number/special)
  .required('Password is required');

export const phoneValidation = Yup.string()
  .matches(REGEX_PATTERNS.PHONE, 'Please enter a valid phone number')
  .required('Phone number is required');

export const nameValidation = Yup.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .required('Name is required');

// Authentication schemas
export const loginSchema = Yup.object().shape({
  email: emailValidation,
  password: Yup.string().required('Password is required'),
  rememberMe: Yup.boolean(),
});

export const registerSchema = Yup.object().shape({
  name: nameValidation,
  firstName: Yup.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: Yup.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: emailValidation,
  phoneNumber: Yup.string()
    .matches(REGEX_PATTERNS.PHONE, 'Please enter a valid phone number')
    .optional(),
  password: passwordValidation,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  acceptedTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: emailValidation,
});

export const resetPasswordSchema = Yup.object().shape({
  password: passwordValidation,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: passwordValidation,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const otpSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^\d{6}$/, 'OTP must be 6 digits')
    .required('OTP is required'),
});

// Profile schemas
export const profileSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: Yup.string().min(2, 'Last name must be at least 2 characters').optional(),
  phoneNumber: Yup.string()
    .matches(REGEX_PATTERNS.PHONE, 'Please enter a valid phone number')
    .optional(),
  dateOfBirth: Yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
  nationality: Yup.string().optional(),
  languagePreference: Yup.string().required('Language preference is required'),
  emergencyContact: Yup.object().shape({
    name: Yup.string().min(2, 'Contact name must be at least 2 characters').optional(),
    phone: Yup.string()
      .matches(REGEX_PATTERNS.PHONE, 'Please enter a valid phone number')
      .optional(),
    relationship: Yup.string().optional(),
  }).optional(),
  address: Yup.object().shape({
    street: Yup.string().optional(),
    city: Yup.string().optional(),
    state: Yup.string().optional(),
    country: Yup.string().optional(),
    postalCode: Yup.string().optional(),
  }).optional(),
});

// Document validation
export const documentUploadSchema = Yup.object().shape({
  documentType: Yup.string().required('Document type is required'),
  description: Yup.string().max(500, 'Description must be less than 500 characters').optional(),
  file: Yup.object().shape({
    uri: Yup.string().required('File is required'),
    name: Yup.string().required('File name is required'),
    type: Yup.string().required('File type is required'),
    size: Yup.number().max(50 * 1024 * 1024, 'File size must be less than 50MB').optional(),
  }).required('File is required'),
});

// Resource search validation
export const resourceSearchSchema = Yup.object().shape({
  query: Yup.string().optional(),
  category: Yup.string().optional(),
  location: Yup.object().shape({
    latitude: Yup.number().min(-90).max(90).required(),
    longitude: Yup.number().min(-180).max(180).required(),
    radius: Yup.number().min(1).max(100).required(),
  }).optional(),
  languages: Yup.array().of(Yup.string()).optional(),
});

// Application validation
export const applicationSchema = Yup.object().shape({
  type: Yup.string().required('Application type is required'),
  title: Yup.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  organizationId: Yup.string().required('Organization is required'),
  priority: Yup.string()
    .oneOf(['low', 'medium', 'high', 'urgent'])
    .required('Priority is required'),
});

// Contact form validation
export const contactFormSchema = Yup.object().shape({
  name: nameValidation,
  email: emailValidation,
  subject: Yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters')
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
});

// Custom validation functions
export const validateFileSize = (file: any, maxSizeInMB: number = 50): boolean => {
  if (!file || !file.size) return true;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const validateFileType = (file: any, allowedTypes: string[]): boolean => {
  if (!file || !file.type) return true;
  return allowedTypes.includes(file.type.toLowerCase());
};

export const validateImageAspectRatio = (
  width: number, 
  height: number, 
  targetRatio: number, 
  tolerance: number = 0.1
): boolean => {
  const actualRatio = width / height;
  return Math.abs(actualRatio - targetRatio) <= tolerance;
};
