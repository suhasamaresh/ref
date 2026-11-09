export interface Application {
  id: string;
  userId: string;
  type: ApplicationType;
  status: ApplicationStatus;
  title: string;
  description?: string;
  resourceId?: string;
  organizationId: string;
  submittedAt: string;
  updatedAt: string;
  deadline?: string;
  priority: ApplicationPriority;
  documents: ApplicationDocument[];
  responses: ApplicationResponse[];
  timeline: ApplicationTimelineItem[];
  notes?: string;
}

export type ApplicationType = 
  | 'asylum'
  | 'housing'
  | 'employment'
  | 'healthcare'
  | 'education'
  | 'financial_aid'
  | 'legal_aid'
  | 'family_reunification'
  | 'citizenship'
  | 'work_permit'
  | 'other';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'withdrawn';

export type ApplicationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface ApplicationDocument {
  id: string;
  documentId: string;
  required: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
}

export interface ApplicationResponse {
  id: string;
  question: string;
  answer: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'file';
  required: boolean;
}

export interface ApplicationTimelineItem {
  id: string;
  timestamp: string;
  type: 'created' | 'submitted' | 'updated' | 'approved' | 'rejected' | 'note';
  title: string;
  description?: string;
  userId?: string;
  userName?: string;
}
