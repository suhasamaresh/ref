import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius } from '../../theme';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  outlined?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  outlined = false,
  icon,
  style,
}: BadgeProps) {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const shadeMap = {
      success: { bg: 'rgba(20, 184, 166, 0.1)', border: '#14B8A6', text: '#14B8A6' }, // Emerald green
      error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#EF4444' }, // Red
      warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#F59E0B' }, // Amber
      info: { bg: 'rgba(20, 184, 166, 0.1)', border: '#14B8A6', text: '#14B8A6' }, // Emerald green
      neutral: { bg: 'rgba(163, 163, 163, 0.1)', border: '#A3A3A3', text: '#A3A3A3' }, // Light gray
    } as const;

    const chosen = shadeMap[variant];

    if (outlined) {
      return {
        backgroundColor: 'transparent',
        borderColor: chosen.border,
        borderWidth: 1,
        textColor: chosen.border,
      };
    }

    return {
      backgroundColor: chosen.bg,
      borderColor: chosen.border,
      borderWidth: 1,
      textColor: chosen.text,
    };
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 8,
          paddingVertical: 2,
          fontSize: 12,
        };
      case 'lg':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 16,
        };
      default: // md
        return {
          paddingHorizontal: 10,
          paddingVertical: 4,
          fontSize: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const styles = StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderRadius: 20,
      backgroundColor: variantStyles.backgroundColor,
      borderColor: variantStyles.borderColor,
      borderWidth: variantStyles.borderWidth,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      shadowColor: '#14B8A6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    text: {
      fontSize: sizeStyles.fontSize,
      fontWeight: '600',
      color: variantStyles.textColor,
      letterSpacing: 0.5,
    },
    icon: {
      marginRight: 6,
    },
  });

  return (
    <View style={[styles.badge, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}