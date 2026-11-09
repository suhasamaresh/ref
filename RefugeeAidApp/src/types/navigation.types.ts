import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modal: {
    screen: string;
    params?: any;
  };
};

// Auth Stack
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: {
    type: 'email' | 'phone';
    contact: string;
  };
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Identity: NavigatorScreenParams<IdentityStackParamList>;
  Resources: NavigatorScreenParams<ResourceStackParamList>;
  News: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Identity Stack
export type IdentityStackParamList = {
  IdentityMain: undefined;
  DocumentUpload: {
    documentType?: string;
  };
  DocumentDetail: {
    documentId: string;
  };
  Verification: undefined;
  QRScanner: undefined;
};

// Resource Stack
export type ResourceStackParamList = {
  ResourceMain: undefined;
  MatchedResources: undefined;
  ResourceDetail: {
    resourceId: string;
  };
  ResourceMap: {
    resources?: any[];
  };
  FavoriteResources: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Language: undefined;
  About: undefined;
  Notifications: undefined;
};

// Navigation Props
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type IdentityStackNavigationProp = StackNavigationProp<IdentityStackParamList>;
export type ResourceStackNavigationProp = StackNavigationProp<ResourceStackParamList>;
export type ProfileStackNavigationProp = StackNavigationProp<ProfileStackParamList>;
