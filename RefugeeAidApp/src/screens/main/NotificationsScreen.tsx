import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // placeholder: replace with notificationService
        setNotifications([]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: theme.spacing.lg }, item: { marginBottom: theme.spacing.md } });

  if (loading) return <Loading visible={true} text={t('common.loading')} />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={notifications}
        keyExtractor={(item, idx) => item.id || String(idx)}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title={t('notifications.emptyTitle')} description={t('notifications.emptyDescription')} />}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <Text style={{ color: theme.colors.text.primary }}>{item.title}</Text>
            <Text style={{ color: theme.colors.text.secondary }}>{item.body}</Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
