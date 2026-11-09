import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function NewsItem({ item }: { item: any }) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: { padding: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    title: { fontSize: 16, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.xs },
    summary: { color: theme.colors.text.secondary }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.summary}>{item.summary || item.body}</Text>
    </View>
  );
}
