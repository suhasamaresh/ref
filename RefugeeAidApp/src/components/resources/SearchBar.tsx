import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
  debounceMs?: number;
}

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
  showFilter = false,
  onFilterPress,
  debounceMs = 500,
}: SearchBarProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    if (onSubmit && debouncedValue !== value) {
      onSubmit(debouncedValue);
    }
  }, [debouncedValue]);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: isFocused ? theme.colors.primary[500] : theme.colors.border,
      paddingHorizontal: theme.spacing.sm,
      height: 48,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      paddingVertical: theme.spacing.sm,
    },
    clearButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    filterButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color={theme.colors.text.secondary}
        style={styles.searchIcon}
      />
      
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={() => onSubmit?.(value)}
        placeholder={placeholder || t('resources.searchPlaceholder')}
        placeholderTextColor={theme.colors.text.placeholder}
        returnKeyType="search"
        clearButtonMode="never"
      />
      
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      )}
      
      {showFilter && onFilterPress && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
