import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/navigation.types';

import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
      />
      <Stack.Screen 
        name="Language" 
        component={LanguageScreen} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
      />
    </Stack.Navigator>
  );
}
