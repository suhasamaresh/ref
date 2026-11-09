import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, View, Text, TextInput,
  TouchableOpacity, Linking,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import Loading   from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Card      from '../../components/common/Card';
import Button    from '../../components/common/Button';
import { resourceService } from '../../services/resourceService';

// Static fallback categories so UI always shows something (fix bug #3)
const FALLBACK_CATEGORIES = [
  { id: 'housing',        name: 'Housing' },
  { id: 'legal',          name: 'Legal Aid' },
  { id: 'healthcare',     name: 'Healthcare' },
  { id: 'food',           name: 'Food' },
  { id: 'employment',     name: 'Employment' },
  { id: 'education',      name: 'Education' },
  { id: 'mentalHealth',   name: 'Mental Health' },
  { id: 'financial',      name: 'Financial Aid' },
  { id: 'transportation', name: 'Transport' },
  { id: 'community',      name: 'Community' },
  { id: 'childcare',      name: 'Childcare' },
  { id: 'emergency',      name: 'Emergency' },
];

export default function ResourcesScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState('');
  const [location,    setLocation]    = useState('');
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState<any[]>([]);
  const [searching,   setSearching]   = useState(false);

  const handleSearch = async () => {
    if (!selectedCat && !query) {
      return;
    }
    setSearching(true);
    setResults([]);
    try {
      const res = await resourceService.searchResourcesAI({
        category: selectedCat, location, query, needs: [],
      });
      setResults(res || []);
    } catch {
      // noop
    } finally {
      setSearching(false);
    }
  };

  const openUrl = (url: string) =>
    Linking.openURL(url).catch(() => {});

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.title}>{t('resources.title') || 'Find Resources'}</Text>
        <Text style={s.subtitle}>{t('resources.subtitle') || 'Find services and support near you'}</Text>

        {/* Category chips */}
        <Text style={s.sectionLabel}>{t('resources.selectCategory') || 'Select a category'}</Text>
        <View style={s.chips}>
          {FALLBACK_CATEGORIES.map(cat => {
            const active = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setSelectedCat(active ? '' : cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {t(`resources.categories.${cat.id}`) || cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Location input */}
        <Text style={s.inputLabel}>Your location</Text>
        <TextInput
          style={s.input}
          placeholder={t('resources.locationPlaceholder') || 'e.g. New York, USA'}
          placeholderTextColor="#A89D8E"
          value={location}
          onChangeText={setLocation}
        />

        {/* Keywords input */}
        <Text style={s.inputLabel}>Keywords (optional)</Text>
        <TextInput
          style={s.input}
          placeholder={t('resources.keywordsPlaceholder') || 'Additional keywords'}
          placeholderTextColor="#A89D8E"
          value={query}
          onChangeText={setQuery}
        />

        <Button
          title={searching ? (t('resources.searching') || 'Searching...') : (t('resources.searchButton') || 'Search resources')}
          onPress={handleSearch}
          disabled={searching || (!selectedCat && !query)}
          fullWidth
          style={{ marginTop: 4, marginBottom: 24 }}
        />

        {searching && <Loading visible text="Searching..." />}

        {!searching && results.length > 0 && (
          <>
            <Text style={s.sectionLabel}>{results.length} results</Text>
            {results.map((r, i) => (
              <TouchableOpacity key={i} onPress={() => openUrl(r.url)} activeOpacity={0.85} style={s.resultCard}>
                <Card>
                  <Text style={s.resultTitle}>{r.title}</Text>
                  <Text style={s.resultDesc}>{r.description}</Text>
                  {r.url ? <Text style={s.resultUrl}>{r.url}</Text> : null}
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        {!searching && results.length === 0 && selectedCat && (
          <EmptyState
            icon="search-outline"
            title="No results found"
            description="Try a different category or location."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content:   { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title:     { fontSize: 22, fontWeight: '700', color: '#2C2620', marginBottom: 6 },
  subtitle:  { fontSize: 14, color: '#6E6358', marginBottom: 24, lineHeight: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#A89D8E', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  chips: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
    marginBottom:  24,
  },
  chip: {
    paddingVertical:    8,
    paddingHorizontal: 14,
    borderRadius:       999,
    backgroundColor:   '#F2EBDF',
    borderWidth:        1,
    borderColor:       '#E8DECF',
  },
  chipActive: {
    backgroundColor: '#F3DCB8',
    borderColor:     '#B5651D',
  },
  chipText:       { fontSize: 13, color: '#6E6358', fontWeight: '500' },
  chipTextActive: { color: '#B5651D', fontWeight: '600' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#6E6358', marginBottom: 6 },
  input: {
    backgroundColor: '#F2EBDF',
    borderRadius:    14,
    borderWidth:      1,
    borderColor:     '#E8DECF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize:        15,
    color:           '#2C2620',
    marginBottom:    16,
    minHeight:       52,
  },
  resultCard:  { marginBottom: 12 },
  resultTitle: { fontSize: 15, fontWeight: '600', color: '#2C2620', marginBottom: 4 },
  resultDesc:  { fontSize: 13, color: '#6E6358', marginBottom: 6, lineHeight: 20 },
  resultUrl:   { fontSize: 12, color: '#2B6E6B' },
});
