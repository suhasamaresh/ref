import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { IdentityStackParamList } from '../types/navigation.types';

import IdentityScreen from '../screens/main/IdentityScreen';
import DocumentUploadScreen from '../screens/identity/DocumentUploadScreen';
import DocumentDetailScreen from '../screens/identity/DocumentDetailScreen';
import VerificationScreen from '../screens/identity/VerificationScreen';
import QRScannerScreen from '../screens/identity/QRScannerScreen';

const Stack = createStackNavigator<IdentityStackParamList>();

export default function IdentityNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="IdentityMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="IdentityMain" 
        component={IdentityScreen} 
      />
      <Stack.Screen 
        name="DocumentUpload" 
        component={DocumentUploadScreen}
        options={{
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="DocumentDetail" 
        component={DocumentDetailScreen}
      />
      <Stack.Screen 
        name="Verification" 
        component={VerificationScreen} 
      />
      <Stack.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
