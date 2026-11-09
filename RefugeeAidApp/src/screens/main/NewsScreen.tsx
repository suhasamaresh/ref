import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/api';

import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const CATEGORY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  policy:    { label: 'Policy',    color: '#B5651D', bg: '#F3DCB8' },
  community: { label: 'Community', color: '#2B6E6B', bg: '#D9EAE8' },
  alert:     { label: 'Alert',     color: '#B3492E', bg: '#F4DCD3' },
  general:   { label: 'Update',    color: '#6E6358', bg: '#F2EBDF' },
};

export default function NewsScreen() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const resp = await apiClient.get<any[]>('/news', {});
        if (resp) setItems(resp);
      } catch (e) {
        // Mock data fallback for prototype
        setItems([
          { id: '1', type: 'alert', title: 'Clinic hours changed', summary: 'The downtown clinic will close at 3PM today.', date: 'Today' },
          { id: '2', type: 'policy', title: 'New documentation requirements', summary: 'Starting next month, additional IDs are needed.', date: 'Yesterday' },
          { id: '3', type: 'community', title: 'Language exchange meetup', summary: 'Join us at the community center this Friday.', date: '2 days ago' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const FILTERS = [
    { id: 'all',       label: 'All Updates' },
    { id: 'alert',     label: 'Alerts' },
    { id: 'policy',    label: 'Policy' },
    { id: 'community', label: 'Community' },
  ];

  const filteredItems = items.filter(i => filter === 'all' || i.type === filter);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header
        title={t('navigation.news') || 'News & Updates'}
        subtitle="Policy changes and announcements"
      />

      <View style={s.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={f => f.id}
          renderItem={({ item }) => {
            const active = filter === item.id;
            return (
              <TouchableOpacity
                style={[s.chip, active && s.chipActive]}
                onPress={() => setFilter(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={i => i.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <Loading visible text="Loading updates..." />
          ) : (
            <EmptyState
              icon="newspaper-outline"
              title="No updates right now"
              description="Check back soon for news and announcements."
            />
          )
        }
        renderItem={({ item }) => {
          const cat = CATEGORY_MAP[item.type] || CATEGORY_MAP.general;
          return (
            <TouchableOpacity style={s.card} activeOpacity={0.8}>
              <View style={[s.pill, { backgroundColor: cat.bg }]}>
                <Text style={[s.pillText, { color: cat.color }]}>{cat.label}</Text>
              </View>
              <Text style={s.headline}>{item.title}</Text>
              <Text style={s.summary} numberOfLines={2}>{item.summary}</Text>
              <Text style={s.time}>{item.date}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  filterRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EBDF',
  },
  chip: {
    paddingVertical:    8,
    paddingHorizontal: 16,
    borderRadius:       999,
    backgroundColor:    '#F2EBDF',
    marginRight:        8,
  },
  chipActive: {
    backgroundColor: '#F3DCB8',
  },
  chipText: {
    fontSize:   13,
    fontWeight: '500',
    color:      '#6E6358',
  },
  chipTextActive: {
    color:      '#B5651D',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    padding:         16,
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.05,
    shadowRadius:    8,
    elevation:       1,
  },
  pill: {
    alignSelf:         'flex-start',
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderRadius:      999,
    marginBottom:      12,
  },
  pillText: {
    fontSize:   11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize:    18,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 6,
  },
  summary: {
    fontSize:   14,
    color:      '#6E6358',
    lineHeight: 22,
    marginBottom: 12,
  },
  time: {
    fontSize: 12,
    color:    '#A89D8E',
  },
});
