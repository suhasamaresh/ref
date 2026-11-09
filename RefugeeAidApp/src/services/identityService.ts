import { apiClient } from './api';
import {
  Document,
  IdentityVerification,
  DocumentUploadRequest,
  DocumentUploadResponse,
  VerificationStatusResponse,
} from '../types/identity.types';

export interface IdentityDocumentData {
  type: string;
  number?: string;
  name?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  issuingCountry?: string;
}

export interface TrustScoreResponse {
  score: number;
  level: string;
  recommendations: string[];
  factors: {
    document_count: number;
    verified_documents: number;
    account_age_days: number;
    activity_score: number;
    has_photo_id: boolean;
  };
}

export interface KYCResponse {
  level: string;
  verified: boolean;
  requirements: string[];
  missing: string[];
}

export interface VerificationStatus {
  trustScore: number;
  trustLevel: string;
  kycStatus: string;
  verificationStatus: string;
  documentCount: number;
  verifiedDocuments: number;
}

export const identityService = {
  // Legacy methods
  async getDocuments(): Promise<Document[]> {
    return apiClient.get<Document[]>('/identity/documents');
  },

  async getDocument(documentId: string): Promise<Document> {
    return apiClient.get<Document>(`/identity/documents/${documentId}`);
  },

  async uploadDocument(
    request: DocumentUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    
    // Create file object for FormData
    formData.append('file', {
      uri: request.file.uri,
      name: request.file.name,
      type: request.file.type,
    } as any);
    
    formData.append('documentType', request.documentType);
    
    if (request.description) {
      formData.append('description', request.description);
    }

    return apiClient.upload<DocumentUploadResponse>(
      '/identity/upload',
      formData,
      onProgress
    );
  },

  async deleteDocument(documentId: string): Promise<void> {
    return apiClient.delete<void>(`/identity/documents/${documentId}`);
  },

  async getVerificationStatus(): Promise<VerificationStatusResponse> {
    return apiClient.get<VerificationStatusResponse>('/identity/status');
  },

  async submitForVerification(): Promise<void> {
    return apiClient.post<void>('/identity/submit');
  },

  async updateDocumentStatus(documentId: string, status: string, notes?: string): Promise<Document> {
    return apiClient.patch<Document>(`/identity/documents/${documentId}/status`, {
      status,
      notes,
    });
  },

  // New ML-powered verification methods
  async uploadDocumentWithVerification(data: IdentityDocumentData): Promise<any> {
    return apiClient.post<any>('/identity/upload-document', data);
  },

  async getUserDocuments(): Promise<any[]> {
    return apiClient.get<any[]>('/identity/documents');
  },

  async getTrustScore(): Promise<TrustScoreResponse> {
    return apiClient.get<TrustScoreResponse>('/identity/trust-score');
  },

  async performKYC(): Promise<KYCResponse> {
    return apiClient.post<KYCResponse>('/identity/kyc-check', {});
  },

  async getVerificationStatusML(): Promise<VerificationStatus> {
    return apiClient.get<VerificationStatus>('/identity/verification-status');
  },
};
