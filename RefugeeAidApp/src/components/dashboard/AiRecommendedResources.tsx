import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Recommendation {
  id: string;
  title: string;
  category: string;
  distance: string;
}

interface Props {
  recommendations: Recommendation[];
  onPress: (id: string) => void;
}

export default function AiRecommendedResources({ recommendations, onPress }: Props) {
  if (recommendations.length === 0) return null;

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Recommended for you</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        style={s.scrollView}
      >
        {recommendations.map(r => (
          <TouchableOpacity
            key={r.id}
            style={s.card}
            onPress={() => onPress(r.id)}
            activeOpacity={0.9}
          >
            <View style={s.iconWrap}>
              <Ionicons name="sparkles" size={16} color="#B5651D" />
            </View>
            <Text style={s.category}>{r.category}</Text>
            <Text style={s.title} numberOfLines={2}>{r.title}</Text>
            <View style={s.distanceRow}>
              <Ionicons name="location-outline" size={12} color="#A89D8E" />
              <Text style={s.distance}>{r.distance}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize:    16,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 16,
  },
  scrollView: {
    marginHorizontal: -20, // Break out of screen padding
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap:               16,
  },
  card: {
    width:           160,
    backgroundColor: '#FFFFFF',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    padding:         16,
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.05,
    shadowRadius:    8,
    elevation:       2,
  },
  iconWrap: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: '#F3DCB8',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    12,
  },
  category: {
    fontSize:     11,
    fontWeight:   '600',
    color:        '#A89D8E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  4,
  },
  title: {
    fontSize:     14,
    fontWeight:   '700',
    color:        '#2C2620',
    lineHeight:   20,
    marginBottom: 12,
    flex:         1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  distance: {
    fontSize: 12,
    color:    '#6E6358',
  },
});
