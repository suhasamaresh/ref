import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightElement?: ReactNode;
  onPress?: () => void;
  type?: 'default' | 'switch' | 'chevron' | 'danger';
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  disabled?: boolean;
}

export default function SettingItem({
  title,
  subtitle,
  icon,
  rightElement,
  onPress,
  type = 'default',
  switchValue = false,
  onSwitchChange,
  disabled = false,
}: SettingItemProps) {
  const { theme } = useTheme();

  const getTitleColor = (): string => {
    if (disabled) return theme.colors.text.disabled;
    if (type === 'danger') return theme.colors.error[500];
    return theme.colors.text.primary;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.gray[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    dangerIconContainer: {
      backgroundColor: theme.colors.error[500],
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: getTitleColor(),
      marginBottom: subtitle ? 2 : 0,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chevron: {
      marginLeft: theme.spacing.sm,
    },
  });

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <View style={[
        styles.iconContainer,
        type === 'danger' && styles.dangerIconContainer,
      ]}>
        <Ionicons
          name={icon}
          size={18}
          color={type === 'danger' ? theme.colors.error[500] : theme.colors.text.secondary}
        />
      </View>
    );
  };

  const renderRightElement = () => {
    if (rightElement) {
      return <View style={styles.rightContainer}>{rightElement}</View>;
    }

    if (type === 'switch') {
      return (
        <View style={styles.rightContainer}>
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            disabled={disabled}
            trackColor={{
              false: theme.colors.gray[100],
              true: theme.colors.primary[500],
            }}
            thumbColor={switchValue ? theme.colors.primary[500] : theme.colors.gray[100]}
          />
        </View>
      );
    }

    if (type === 'chevron' || onPress) {
      return (
        <View style={styles.rightContainer}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.secondary}
            style={styles.chevron}
          />
        </View>
      );
    }

    return null;
  };

  const ItemComponent = onPress && !disabled ? TouchableOpacity : View;

  return (
    <ItemComponent
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {renderIcon()}
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {renderRightElement()}
    </ItemComponent>
  );
}
