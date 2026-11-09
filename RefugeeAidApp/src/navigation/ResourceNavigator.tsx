import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ResourceStackParamList } from '../types/navigation.types';

import ResourcesScreen from '../screens/main/ResourcesScreen';
import ResourceDetailScreen from '../screens/resources/ResourceDetailScreen';
import ResourceMapScreen from '../screens/resources/ResourceMapScreen';
import FavoriteResourcesScreen from '../screens/resources/FavoriteResourcesScreen';
import MatchedResourcesScreen from '../screens/resources/MatchedResourcesScreen';

const Stack = createStackNavigator<ResourceStackParamList>();

export default function ResourceNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ResourceMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="ResourceMain" 
        component={ResourcesScreen} 
      />
      <Stack.Screen
        name="MatchedResources"
        component={MatchedResourcesScreen}
        options={{
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="ResourceDetail" 
        component={ResourceDetailScreen}
        options={{
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="ResourceMap" 
        component={ResourceMapScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="FavoriteResources" 
        component={FavoriteResourcesScreen} 
      />
    </Stack.Navigator>
  );
}
