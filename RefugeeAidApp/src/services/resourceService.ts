  import { apiClient } from './api';
import {
  Resource,
  ResourceSearchParams,
  ResourceSearchResponse,
} from '../types/resource.types';

export const resourceService = {
  async getCategories(): Promise<any[]> {
    return apiClient.get<any[]>('/resources/categories');
  },

  async searchResourcesAI(data: { category?: string; location?: string; query?: string; needs?: string[] }): Promise<any[]> {
    return apiClient.post<any[]>('/resources/search', data);
  },

  async getMatchedResources(userId?: string): Promise<Resource[]> {
    // If userId is not provided, backend will use authenticated user
    const params = userId ? { userId } : undefined;
    return apiClient.get<Resource[]>('/resources/match', params);
  },
  
  async getResources(params?: ResourceSearchParams): Promise<ResourceSearchResponse> {
    return apiClient.get<ResourceSearchResponse>('/resources', params);
  },

  async getResource(resourceId: string): Promise<Resource> {
    return apiClient.get<Resource>(`/resources/${resourceId}`);
  },

  async searchResources(params: ResourceSearchParams): Promise<ResourceSearchResponse> {
    return apiClient.get<ResourceSearchResponse>('/resources/search', params);
  },

  async getFavoriteResources(): Promise<Resource[]> {
    return apiClient.get<Resource[]>('/resources/favorites');
  },

  async addToFavorites(resourceId: string): Promise<void> {
    return apiClient.post<void>(`/resources/${resourceId}/favorite`);
  },

  async removeFromFavorites(resourceId: string): Promise<void> {
    return apiClient.delete<void>(`/resources/${resourceId}/favorite`);
  },

  async rateResource(resourceId: string, rating: number, review?: string): Promise<void> {
    return apiClient.post<void>(`/resources/${resourceId}/rate`, {
      rating,
      review,
    });
  },

  async reportResource(resourceId: string, reason: string, description?: string): Promise<void> {
    return apiClient.post<void>(`/resources/${resourceId}/report`, {
      reason,
      description,
    });
  },
};
