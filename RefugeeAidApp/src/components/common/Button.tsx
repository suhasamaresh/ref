import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

// Design tokens
const T = {
  primary:      '#B5651D',
  primaryMuted: '#F3DCB8',
  secondary:    '#2B6E6B',
  surfaceAlt:   '#F2EBDF',
  textMuted:    '#A89D8E',
  error:        '#B3492E',
  white:        '#FFFFFF',
  textPrimary:  '#2C2620',
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const getHeight = () => {
    switch (size) {
      case 'sm': return 40;
      case 'lg': return 56;
      default:   return 52;
    }
  };

  const getPaddingH = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 24;
      default:   return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 17;
      default:   return 16;
    }
  };

  const getVariant = (): { bg: string; border: string; textColor: string } => {
    if (disabled) {
      return { bg: T.surfaceAlt, border: T.surfaceAlt, textColor: T.textMuted };
    }
    switch (variant) {
      case 'secondary':
        return { bg: T.primaryMuted, border: T.primary, textColor: T.primary };
      case 'outline':
        return { bg: 'transparent', border: T.primary, textColor: T.primary };
      case 'ghost':
        return { bg: 'transparent', border: 'transparent', textColor: T.secondary };
      case 'danger':
        return { bg: T.error, border: T.error, textColor: T.white };
      default:
        return { bg: T.primary, border: T.primary, textColor: T.white };
    }
  };

  const { bg, border, textColor } = getVariant();

  const styles = StyleSheet.create({
    btn: {
      height:           getHeight(),
      paddingHorizontal: getPaddingH(),
      backgroundColor:  bg,
      borderColor:      border,
      borderWidth:      variant === 'primary' || variant === 'danger' ? 0 : 1.5,
      borderRadius:     14,
      flexDirection:    'row',
      alignItems:       'center',
      justifyContent:   'center',
      width:            fullWidth ? '100%' : 'auto',
      // Warm shadow on primary only — no glow
      shadowColor:      variant === 'primary' && !disabled ? '#2C2620' : 'transparent',
      shadowOffset:     { width: 0, height: 2 },
      shadowOpacity:    0.12,
      shadowRadius:     6,
      elevation:        variant === 'primary' && !disabled ? 2 : 0,
    },
    label: {
      fontSize:    getFontSize(),
      fontWeight:  '600',
      color:       textColor,
      textAlign:   'center',
      letterSpacing: 0.2,
    },
    iconL: { marginEnd:   8 },
    iconR: { marginStart: 8 },
  });

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={() => {
        try { console.log('Button pressed', { title, testID, disabled, loading }); } catch (_) {}
        if (!disabled && !loading) onPress();
      }}
      disabled={disabled || loading}
      activeOpacity={0.82}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left'  && <View style={styles.iconL}>{icon}</View>}
          <Text style={[styles.label, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconR}>{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}