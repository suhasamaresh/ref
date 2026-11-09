import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
}

export default function Avatar({
  source,
  name = '',
  size = 40,
  backgroundColor,
  textColor,
  onPress,
  style,
  showBadge = false,
  badgeColor,
}: AvatarProps) {
  const { theme } = useTheme();

  const defaultBackgroundColor = backgroundColor || '#1E1E1E'; // Slightly lighter black
  const defaultTextColor = textColor || '#FFFFFF'; // White for contrast
  const defaultBadgeColor = badgeColor || '#14B8A6'; // Emerald green

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: defaultBackgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      shadowColor: '#14B8A6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    image: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    text: {
      fontSize: size * 0.4,
      fontWeight: '600',
      color: defaultTextColor,
      letterSpacing: 0.5,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: size * 0.3,
      height: size * 0.3,
      borderRadius: (size * 0.3) / 2,
      backgroundColor: defaultBadgeColor,
      borderWidth: 2,
      borderColor: '#121212', // Matches background
    },
  });

  const initials = getInitials(name);

  const AvatarComponent = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.container, style]}>
      <AvatarComponent
        style={styles.avatar}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {source ? (
          <Image
            source={{ uri: source }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.text}>{initials}</Text>
        )}
      </AvatarComponent>
      
      {showBadge && <View style={styles.badge} />}
    </View>
  );
}