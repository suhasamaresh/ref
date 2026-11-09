import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/auth/SplashScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isInitialized, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  // While initializing, show Splash inside a NavigationContainer so it can use navigation APIs.
  if (!isInitialized) {
    return (
      <NavigationContainer
        theme={{
          dark: theme.isDark,
          colors: {
            primary: theme.colors.primary[500],
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text.primary,
            border: theme.colors.border,
            notification: theme.colors.error[500],
          },
          fonts: {} as any,
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.isDark,
        colors: {
          primary: theme.colors.primary[500],
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text.primary,
          border: theme.colors.border,
          notification: theme.colors.error[500],
        },
        fonts: {} as any,
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isAuthenticated ? 'Main' : 'Auth'}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
