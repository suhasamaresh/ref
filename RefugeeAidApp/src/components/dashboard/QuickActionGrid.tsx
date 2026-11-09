import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  mutedColor: string;
  onPress: () => void;
}

interface Props {
  actions: QuickAction[];
}

export default function QuickActionGrid({ actions }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
      style={s.container}
    >
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={s.actionItem}
          onPress={action.onPress}
          activeOpacity={0.8}
        >
          <View style={[s.iconWrap, { backgroundColor: action.mutedColor }]}>
            <Ionicons name={action.icon} size={28} color={action.color} />
          </View>
          <Text style={s.actionLabel} numberOfLines={2}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: -20, // break out of screen padding
    marginBottom:     32,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap:               16,
  },
  actionItem: {
    alignItems: 'center',
    width:      80,
  },
  iconWrap: {
    width:          72,
    height:         72,
    borderRadius:   24, // squircle shape
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   8,
    // Add subtle shadow so it feels tactile
    shadowColor:    '#2C2620',
    shadowOffset:   { width: 0, height: 2 },
    shadowOpacity:  0.05,
    shadowRadius:   6,
    elevation:      1,
  },
  actionLabel: {
    fontSize:   12,
    fontWeight: '600',
    color:      '#6E6358',
    textAlign:  'center',
    lineHeight: 16,
  },
});