import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  pressable?: boolean;
  onPress?: () => void;
}

const PADDING_MAP = { none: 0, xs: 8, sm: 12, md: 16, lg: 20, xl: 24 };
const RADIUS_MAP  = { none: 0, sm: 8, md: 14, lg: 20, xl: 24, full: 999 };

const CARD_SHADOW = {
  shadowColor:   '#2C2620',
  shadowOffset:  { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius:  12,
  elevation:     2,
};

export default function Card({
  children,
  style,
  padding = 'md',
  shadow = 'medium',
  borderRadius: br = 'lg',
  pressable = false,
  onPress,
}: CardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius:    RADIUS_MAP[br] ?? 20,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    padding:         PADDING_MAP[padding] ?? 16,
    overflow:        'hidden',
    ...(shadow !== 'none' ? CARD_SHADOW : {}),
  };

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.87}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}