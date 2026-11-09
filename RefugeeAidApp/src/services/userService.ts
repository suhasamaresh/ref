import { apiClient } from './api';
import { User, UserProfile, UserSettings } from '../types/auth.types';

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/user/profile');
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<User> {
    return apiClient.put<User>('/user/profile', profile);
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return apiClient.put<UserSettings>('/user/settings', settings);
  },

  async uploadAvatar(file: { uri: string; name: string; type: string }): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    return apiClient.upload<{ avatarUrl: string }>('/user/avatar', formData);
  },

  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>('/user/account');
  },
};
