import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation.types';

import DashboardScreen  from '../screens/main/DashboardScreen';
import IdentityNavigator  from './IdentityNavigator';
import ResourceNavigator  from './ResourceNavigator';
import NewsScreen       from '../screens/main/NewsScreen';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

// One consistent active color across all 5 tabs — amber
const ACTIVE   = '#B5651D';
const ACTIVE_BG= '#F3DCB8';
const INACTIVE = '#A89D8E';
const TAB_H    = Platform.OS === 'ios' ? 80 : 68;

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
            Dashboard: ['home',             'home-outline'],
            Identity:  ['shield-checkmark', 'shield-checkmark-outline'],
            Resources: ['library',          'library-outline'],
            News:      ['newspaper',        'newspaper-outline'],
            Profile:   ['person',           'person-outline'],
          };
          const [filledIcon, outlineIcon] = icons[route.name] || ['help', 'help-outline'];
          return (
            <View style={[s.iconWrap, focused && s.iconWrapActive]}>
              <Ionicons
                name={focused ? filledIcon : outlineIcon}
                size={22}
                color={color}
              />
            </View>
          );
        },
        tabBarActiveTintColor:   ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth:  1,
          borderTopColor:  '#E8DECF',
          height:          TAB_H,
          paddingBottom:   Platform.OS === 'ios' ? 20 : 10,
          paddingTop:      8,
          paddingHorizontal: 4,
          shadowColor:     '#2C2620',
          shadowOffset:    { width: 0, height: -2 },
          shadowOpacity:   0.06,
          shadowRadius:    8,
          elevation:       8,
        },
        tabBarLabelStyle: {
          fontSize:     11,
          fontWeight:   '600',
          letterSpacing: 0.2,
          marginTop:     2,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Identity"  component={IdentityNavigator}  options={{ tabBarLabel: 'Identity' }} />
      <Tab.Screen name="Resources" component={ResourceNavigator}  options={{ tabBarLabel: 'Resources' }} />
      <Tab.Screen name="News"      component={NewsScreen}       options={{ tabBarLabel: 'Updates' }} />
      <Tab.Screen name="Profile"   component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  iconWrap: {
    width:           38,
    height:          30,
    borderRadius:    999,
    alignItems:      'center',
    justifyContent:  'center',
  },
  iconWrapActive: {
    backgroundColor: ACTIVE_BG,
    paddingHorizontal: 12,
    paddingVertical:   4,
    borderRadius:    999,
  },
});
