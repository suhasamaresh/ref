import { Location } from './resource.types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  skills?: string[];
  interests?: string[];
  needs?: string[];
  location?: Location;
  language?: string;
  createdAt: string;
  updatedAt: string;
}
