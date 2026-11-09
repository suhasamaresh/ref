import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius } from '../../theme';

interface AlertProps {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  position?: 'top' | 'bottom';
}

export default function Alert({
  visible,
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose,
  position = 'top',
}: AlertProps) {
  const { theme } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: position === 'top' ? -100 : 100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(20, 184, 166, 0.1)', // Emerald tint
          borderColor: '#14B8A6', // Emerald green
          iconColor: '#14B8A6',
          textColor: '#FFFFFF', // White for contrast
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red tint
          borderColor: '#EF4444', // Red
          iconColor: '#EF4444',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber tint
          borderColor: '#F59E0B', // Amber
          iconColor: '#F59E0B',
          textColor: '#FFFFFF',
        };
      default: // info
        return {
          backgroundColor: 'rgba(20, 184, 166, 0.1)', // Emerald tint
          borderColor: '#14B8A6', // Emerald green
          iconColor: '#14B8A6',
          textColor: '#FFFFFF',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const alertStyle = getAlertStyle();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: position === 'top' ? 50 : undefined,
      bottom: position === 'bottom' ? 50 : undefined,
      left: 20,
      right: 20,
      zIndex: 9999,
    },
    alert: {
      backgroundColor: alertStyle.backgroundColor,
      borderColor: alertStyle.borderColor,
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
      shadowColor: '#14B8A6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    iconContainer: {
      marginRight: 10,
      paddingTop: 2,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: alertStyle.textColor,
      marginBottom: title ? 5 : 0,
      letterSpacing: 0.5,
    },
    message: {
      fontSize: 14,
      color: alertStyle.textColor,
      lineHeight: 20,
    },
    closeButton: {
      padding: 5,
      marginLeft: 10,
    },
  });

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.alert,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={getIcon() as any}
            size={24}
            color={alertStyle.iconColor}
          />
        </View>
        
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
        </View>
        
        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close"
              size={20}
              color={alertStyle.iconColor}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}