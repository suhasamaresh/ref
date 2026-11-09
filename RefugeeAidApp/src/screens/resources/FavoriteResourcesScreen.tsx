import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import { resourceService } from '../../services/resourceService';

export default function FavoriteResourcesScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await resourceService.getFavoriteResources();
        const data = (res as any).data || res;
        setResources(Array.isArray(data) ? data : []);
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
        data={resources}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState icon="heart-outline" title={t('resources.favoritesEmptyTitle')} description={t('resources.favoritesEmptyDescription')} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ResourceDetail', { resourceId: item.id })}>
            <Card>
              <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: theme.colors.text.secondary }}>{item.organization?.name}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
