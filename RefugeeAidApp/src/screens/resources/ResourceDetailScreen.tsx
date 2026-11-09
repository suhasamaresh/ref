import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { resourceService } from '../../services/resourceService';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';

export default function ResourceDetailScreen({ route, navigation }: any) {
  const { resourceId } = route.params || {};
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await resourceService.getResource(resourceId);
        const data = (res as any).data || res;
        setResource(data);
      } catch (err) {
        console.error(err);
        Alert.alert(t('common.error'), t('errors.loadError'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    if (resourceId) load();
  }, [resourceId]);

  const handleFavorite = async () => {
    try {
      if (resource.isFavorited) {
        await resourceService.removeFromFavorites(resource.id);
      } else {
        await resourceService.addToFavorites(resource.id);
      }
      // refresh
      const res = await resourceService.getResource(resourceId);
      setResource((res as any).data || res);
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.saveError'));
    }
  };

  if (loading) return <Loading visible={true} text={t('common.loading')} />;

  if (!resource) return null;

  const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, scroll: { flex: 1 }, content: { padding: theme.spacing.lg } });

  return (
    <SafeAreaView style={styles.container}>
  <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { flexGrow: 1 }] }>
        <Card>
          <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>{resource.title}</Text>
          <Text style={{ color: theme.colors.text.secondary }}>{resource.organization?.name}</Text>
          <Text style={{ color: theme.colors.text.secondary }}>{resource.description}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
