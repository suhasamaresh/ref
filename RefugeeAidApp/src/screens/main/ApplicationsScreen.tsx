import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/api';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { Application } from '../../types/application.types';
import { formatDate } from '../../utils/helpers';

export default function ApplicationsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    item: {
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    meta: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
  });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<Application[]>('/applications');
      const data = (res as any).data || res;
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Application }) => (
    <TouchableOpacity style={styles.item} onPress={() => {}}>
      <Card>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{t(`applications.status.${item.status}`) || item.status}</Text>
        <Text style={styles.meta}>{formatDate(item.submittedAt, 'short')}</Text>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <Loading visible={true} text={t('common.loading')} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-outline"
            title={t('applications.emptyTitle')}
            description={t('applications.emptyDescription')}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}
