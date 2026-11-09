import React from 'react';
import { SafeAreaView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations, SupportedLanguage } from '../../locales';

export default function LanguageScreen() {
  const { theme } = useTheme();
  const { t, setLanguage } = useLanguage();

  const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: theme.spacing.lg } });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {Object.keys(translations).map((code) => (
          <TouchableOpacity key={code} onPress={() => setLanguage(code as SupportedLanguage)} style={{ padding: theme.spacing.md }}>
            <Text style={{ color: theme.colors.text.primary }}>{code.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
