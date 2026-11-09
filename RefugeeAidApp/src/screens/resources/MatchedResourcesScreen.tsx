import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet, TouchableOpacity, Text, View, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import { resourceService } from '../../services/resourceService';
import { Resource } from '../../types/resource.types';
import { useAuth } from '../../hooks/useAuth';

export default function MatchedResourcesScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: theme.spacing.lg }, item: { marginBottom: theme.spacing.md } });

  const load = async () => {
    setLoading(true);
    try {
  // @ts-ignore: getMatchedResources may not be typed yet
  const res = await (resourceService as any).getMatchedResources?.(user?.id);
  setResources(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loading visible={true} text={t('common.loading')} />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={resources}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  ListEmptyComponent={<EmptyState icon="search-outline" title={t('resources.matchEmptyTitle') || 'No matched resources found'} description={t('resources.matchEmptyDescription') || 'Try updating your profile or preferences.'} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ResourceDetail', { resourceId: item.id })}>
            <Card>
              <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: theme.colors.text.secondary }}>{item.organization?.name}</Text>
              {item.location?.name && (
                <Text style={{ color: theme.colors.text.secondary }}>{item.location.name}</Text>
              )}
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
