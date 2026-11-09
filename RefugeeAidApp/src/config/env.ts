import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface Config {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  MULTILINGUAL_CHATBOT_URL?: string;
  APP_NAME: string;
  APP_VERSION: string;
  APP_ENV: 'development' | 'staging' | 'production';
}

const getHost = () => {
  try {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      return hostUri.split(':')[0];
    }
  } catch (e) {}
  return Platform.OS === 'android' ? '192.168.1.36' : 'localhost';
};

const HOST = getHost();

const config: Config = {
  // Use EXPO config / env when available, otherwise pick a sensible dev fallback.
  // We use the dynamic HOST so physical devices running Expo Go get the right IP.
  API_BASE_URL:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL ||
    `http://${HOST}:5000/api`,
  MULTILINGUAL_CHATBOT_URL:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_CHATBOT_URL ||
    `http://${HOST}:8000`,
  API_TIMEOUT: parseInt(Constants.expoConfig?.extra?.EXPO_PUBLIC_API_TIMEOUT || '15000'),
  APP_NAME: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_NAME || 'AI Refugee Aid',
  APP_VERSION: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  APP_ENV: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV || 'development',
};

export default config;
