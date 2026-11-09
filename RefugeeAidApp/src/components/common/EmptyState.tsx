import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  children?: ReactNode;
  style?: ViewStyle;
}

export default function EmptyState({
  icon = 'document-outline',
  title,
  description,
  actionText,
  onAction,
  children,
  style,
}: EmptyStateProps) {
  return (
    <View style={[s.container, style]}>
      <View style={s.iconWrap}>
        <Ionicons name={icon} size={40} color="#B5651D" />
      </View>
      <Text style={s.title}>{title}</Text>
      {description && <Text style={s.desc}>{description}</Text>}
      {children}
      {actionText && onAction && (
        <View style={s.actionWrap}>
          <Button title={actionText} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems:      'center',
    justifyContent:  'center',
    padding:         32,
  },
  iconWrap: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: '#F3DCB8',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    20,
  },
  title: {
    fontSize:    18,
    fontWeight:  '600',
    color:       '#2C2620',
    textAlign:   'center',
    marginBottom: 8,
  },
  desc: {
    fontSize:   14,
    color:      '#6E6358',
    textAlign:  'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  actionWrap: { marginTop: 24 },
});