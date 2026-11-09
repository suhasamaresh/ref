import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ApiResponse, ApiError, RequestConfig } from '../types/api.types';
import { STORAGE_KEYS } from '../utils/constants';

// Resolve API base URL with multiple fallbacks so devices/emulators use the correct host.
// Priority:
// 1) runtime env (process.env.EXPO_PUBLIC_API_BASE_URL)
// 2) expo config extras (Constants.expoConfig.extra.EXPO_PUBLIC_API_BASE_URL)
// 3) derive host from Expo debuggerHost (useful when running on device/emulator)
// 4) localhost fallback
const ENV_API = (typeof process !== 'undefined' && (process.env as any)?.EXPO_PUBLIC_API_BASE_URL) as string | undefined;
const EXPO_EXTRA_API = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL as string | undefined;

// Helper: derive host IP from the Expo debuggerHost (e.g. "192.168.1.37:8081")
const deriveHostFromDebugger = (): string | undefined => {
  try {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5000/api`;
      }
    }
  } catch (_) {
    // ignore
  }
  return undefined;
};

const DERIVED_FROM_DEBUGGER = deriveHostFromDebugger();
// Default fallback: choose host-friendly address for Android emulators
const DEFAULT_FALLBACK = Platform.OS === 'android' ? 'http://192.168.1.36:5000/api' : 'http://localhost:5000/api';

export const API_BASE_URL = ENV_API || EXPO_EXTRA_API || DERIVED_FROM_DEBUGGER || DEFAULT_FALLBACK;

// Diagnostic at module load so we can confirm the resolved base URL in device logs
console.log('API_BASE_URL resolved to:', API_BASE_URL);

// Normalize for Android emulator: if resolved API_BASE_URL uses localhost or 127.0.0.1,
// replace it with 10.0.2.2 so the Android emulator can reach the host machine,
// UNLESS we already derived a real IP from Expo Go.
const normalizeForAndroid = (url: string) => {
  try {
    if (Platform.OS === 'android' && typeof url === 'string') {
      // If we already have a real IP (not localhost/127.0.0.1/192.168.1.36), keep it!
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        return url;
      }
      return url.replace('http://localhost', 'http://192.168.1.36').replace('http://127.0.0.1', 'http://192.168.1.36');
    }
  } catch (e) {
    // ignore
  }
  return url;
};

export const FINAL_API_BASE_URL = normalizeForAndroid(API_BASE_URL);
console.log('FINAL_API_BASE_URL resolved to:', FINAL_API_BASE_URL);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: FINAL_API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
  // Add request timestamp for debugging
  (config as any).metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time for debugging (metadata is a custom property)
        const metadata = (response.config as any).metadata;
        if (metadata?.startTime) {
          const endTime = new Date();
          const duration = endTime.getTime() - metadata.startTime.getTime();
          console.log(`API Call: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
        // Build detailed diagnostic info
        const req = (error.config || {}) as AxiosRequestConfig;
        const diagnostic: any = {
          message: this.extractErrorMessage(error),
          code: error.code,
          status: error.response?.status,
          url: `${req.baseURL || ''}${req.url || ''}`,
          method: (req.method || '').toUpperCase(),
          requestData: req.data,
          requestParams: req.params,
          responseData: error.response?.data,
          responseHeaders: error.response?.headers,
          stack: error.stack,
        };

        // Transform axios error to our ApiError format
        const apiError: ApiError = {
          success: false,
          message: diagnostic.message || 'An error occurred',
          errors: (error.response?.data as any)?.errors,
          statusCode: error.response?.status,
          code: error.code,
        };

        // Structured logging to help debugging network issues
        console.error('API Error Diagnostic:', JSON.stringify(diagnostic, null, 2));
        console.error('API Error (normalized):', apiError);

        return Promise.reject(apiError);
      }
    );
  }

  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      return data.message || data.error || 'An error occurred';
    }
    
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'ECONNABORTED':
        return 'Network connection failed. Please check your internet connection.';
      case 'TIMEOUT':
        return 'Request timed out. Please try again.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  async get<T>(url: string, params?: object, config?: RequestConfig): Promise<T> {
    // Convert our RequestConfig to AxiosRequestConfig and map progress callbacks
    const { onUploadProgress, onDownloadProgress, ...restConfig } = config || {};
    const axiosConfig: AxiosRequestConfig = {
      params,
      ...restConfig,
    } as AxiosRequestConfig;

    if (onDownloadProgress) {
      axiosConfig.onDownloadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onDownloadProgress(percent);
        }
      };
    }

    const response = await this.client.get<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, axiosConfig);
    return response.data.data;
  }

  async post<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
    // Map our RequestConfig to AxiosRequestConfig and adapt progress callbacks
    const axiosConfig: AxiosRequestConfig = { ...(config as any) } as AxiosRequestConfig;
    if (config?.onUploadProgress) {
      axiosConfig.onUploadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onUploadProgress?.(percent);
        }
      };
    }
    if (config?.onDownloadProgress) {
      axiosConfig.onDownloadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onDownloadProgress?.(percent);
        }
      };
    }

    const response = await this.client.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, data, axiosConfig);
    return response.data.data;
  }

  async put<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
    const axiosConfig: AxiosRequestConfig = { ...(config as any) } as AxiosRequestConfig;
    if (config?.onUploadProgress) {
      axiosConfig.onUploadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onUploadProgress?.(percent);
        }
      };
    }
    if (config?.onDownloadProgress) {
      axiosConfig.onDownloadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onDownloadProgress?.(percent);
        }
      };
    }

    const response = await this.client.put<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, data, axiosConfig);
    return response.data.data;
  }

  async patch<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
    const axiosConfig: AxiosRequestConfig = { ...(config as any) } as AxiosRequestConfig;
    if (config?.onUploadProgress) {
      axiosConfig.onUploadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onUploadProgress?.(percent);
        }
      };
    }
    if (config?.onDownloadProgress) {
      axiosConfig.onDownloadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onDownloadProgress?.(percent);
        }
      };
    }

    const response = await this.client.patch<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, data, axiosConfig);
    return response.data.data;
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const axiosConfig: AxiosRequestConfig = { ...(config as any) } as AxiosRequestConfig;
    if (config?.onDownloadProgress) {
      axiosConfig.onDownloadProgress = (progressEvent: any) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onDownloadProgress?.(percent);
        }
      };
    }

    const response = await this.client.delete<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, axiosConfig);
    return response.data.data;
  }

  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    config?: RequestConfig
  ): Promise<T> {
    // Remove onDownloadProgress from config to avoid type conflict
    const { onDownloadProgress, ...restConfig } = config || {};
    const response = await this.client.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, formData, {
      ...restConfig,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data.data;
  }

  // Utility methods
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  getBaseURL(): string {
    return FINAL_API_BASE_URL;
  }
}

export const apiClient = new ApiClient();
