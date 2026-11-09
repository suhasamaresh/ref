import { VerificationStatus } from "./auth.types";

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uri: string;
  publicUrl?: string;
  uploadedAt: string;
  status: DocumentStatus;
  verificationNotes?: string;
  metadata?: DocumentMetadata;
}

export type DocumentType = 
  | 'passport'
  | 'national_id'
  | 'birth_certificate'
  | 'refugee_certificate'
  | 'asylum_document'
  | 'driver_license'
  | 'visa'
  | 'residence_permit'
  | 'work_permit'
  | 'health_card'
  | 'other';

export type DocumentStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'requires_update';

export interface DocumentMetadata {
  extractedText?: string;
  confidence?: number;
  extractedData?: {
    name?: string;
    documentNumber?: string;
    expiryDate?: string;
    issueDate?: string;
    nationality?: string;
  };
  aiAnalysis?: {
    isValid: boolean;
    confidence: number;
    flags: string[];
  };
}

export interface IdentityVerification {
  id: string;
  userId: string;
  status: VerificationStatus;
  completedSteps: VerificationStep[];
  currentStep: VerificationStep;
  documents: Document[];
  progress: number; // 0-100
  estimatedCompletionTime?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string[];
}

export type VerificationStep = 
  | 'personal_info'
  | 'document_upload'
  | 'identity_verification'
  | 'biometric_verification'
  | 'manual_review'
  | 'completed';

export interface DocumentUploadRequest {
  file: {
    uri: string;
    name: string;
    type: string;
    size?: number;
  };
  documentType: DocumentType;
  description?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  data: Document;
  message?: string;
}

export interface VerificationStatusResponse {
  success: boolean;
  data: IdentityVerification;
  message?: string;
}
