import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: theme.spacing.lg } });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={{ color: theme.colors.text.primary }}>{t('about.title')}</Text>
        <Text style={{ color: theme.colors.text.secondary }}>{t('about.description')}</Text>
      </View>
    </SafeAreaView>
  );
}
