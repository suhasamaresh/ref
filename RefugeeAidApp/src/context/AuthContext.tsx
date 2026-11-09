import * as React from 'react';
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types/auth.types';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

type AuthAction =
  | { type: 'INIT_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
};

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_SUCCESS':
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          // OPTIMISTIC STARTUP: Let the user in immediately based on cached data
          dispatch({ type: 'INIT_SUCCESS', payload: { user, token } });
          
          // Verify token in the background silently
          authService.verifyToken().then(async (verifiedUser) => {
             // If valid, optionally update user profile data
             dispatch({ type: 'UPDATE_USER', payload: verifiedUser });
          }).catch(async (error) => {
             // Token invalid, clear storage and log out silently
             console.warn('Background token verification failed, logging out.');
             await clearAuthData();
             dispatch({ type: 'LOGOUT' });
          });

        } catch (error) {
          // JSON parse failed or other error, clear storage
          await clearAuthData();
          dispatch({ type: 'SET_INITIALIZED' });
        }
      } else {
        dispatch({ type: 'SET_INITIALIZED' });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'SET_INITIALIZED' });
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login({ email, password });
      
      // Normalize token field: some backends return `accessToken` instead of `token`
      const token = (response as any).token ?? (response as any).accessToken ?? null;
      const refreshToken = (response as any).refreshToken ?? null;

      // Store auth data
      if (token) await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify((response as any).user));
      if (refreshToken) await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: (response as any).user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.register({ 
        name, 
        email, 
        password, 
        confirmPassword: password,
        phoneNumber,
        acceptedTerms: true,
      });
      console.debug('Auth register response:', response);

      const token = (response as any).token ?? (response as any).accessToken ?? null;
      const refreshToken = (response as any).refreshToken ?? null;

      if (token) await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify((response as any).user));
      if (refreshToken) await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: (response as any).user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = async (user: User) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken({ refreshToken });

      const token = (response as any).token ?? (response as any).accessToken ?? null;
      const newRefreshToken = (response as any).refreshToken ?? null;

      if (token) await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify((response as any).user));
      if (newRefreshToken) await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: (response as any).user, token } });
    } catch (error) {
      await logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, updateUser, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    ...context.state,
    ...context,
  };
}
