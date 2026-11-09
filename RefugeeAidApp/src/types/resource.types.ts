export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  organization: Organization;
  location?: Location;
  contact: ContactInfo;
  availability: Availability;
  eligibility?: EligibilityRequirements;
  languages: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ResourceCategory = 
  | 'housing'
  | 'employment'
  | 'legal'
  | 'healthcare'
  | 'education'
  | 'food'
  | 'transportation'
  | 'mental_health'
  | 'language_learning'
  | 'financial'
  | 'childcare'
  | 'emergency'
  | 'community'
  | 'other';

export type ResourceType = 
  | 'service'
  | 'information'
  | 'facility'
  | 'program'
  | 'hotline'
  | 'website';

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  isVerified: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accessibility?: {
    wheelchairAccessible: boolean;
    publicTransportAccess: boolean;
    parkingAvailable: boolean;
  };
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface Availability {
  hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  timezone: string;
  notes?: string;
  is24Hours?: boolean;
  appointmentRequired?: boolean;
}

export interface EligibilityRequirements {
  age?: {
    min?: number;
    max?: number;
  };
  residencyStatus?: string[];
  income?: {
    max?: number;
    currency: string;
  };
  documentation?: DocumentType[];
  other?: string[];
}

export interface ResourceSearchParams {
  query?: string;
  category?: ResourceCategory;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  languages?: string[];
  sort?: 'relevance' | 'distance' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

export interface ResourceSearchResponse {
  success: boolean;
  data: {
    resources: Resource[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}
