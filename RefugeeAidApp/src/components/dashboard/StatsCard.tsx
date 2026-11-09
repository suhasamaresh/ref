import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Semantic icon/color mapping — 3 accents only
// amber=documents, teal=resources/apps, sage=verification/progress
const SHADOW = {
  shadowColor:   '#2C2620',
  shadowOffset:  { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius:  12,
  elevation:     2,
};

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  mutedColor: string;
  subtitle?: string;
  progress?: number; // 0-100, only show bar if provided
  onPress?: () => void;
}

export default function StatsCard({
  title, value, icon, color, mutedColor, subtitle, progress, onPress,
}: StatsCardProps) {
  const Wrap = onPress ? TouchableOpacity : View;

  return (
    <Wrap style={s.card} onPress={onPress} activeOpacity={0.87}>
      {/* Icon */}
      <View style={[s.iconWrap, { backgroundColor: mutedColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      {/* Number */}
      <Text style={s.value}>{value}</Text>

      {/* Label */}
      <Text style={s.label} numberOfLines={2}>{title}</Text>

      {/* Subtitle */}
      {subtitle && !progress && (
        <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>
      )}

      {/* Real progress bar (verification card only) */}
      {progress !== undefined && (
        <View style={s.barTrack}>
          <View style={[s.barFill, { backgroundColor: color, width: `${Math.min(progress, 100)}%` as any }]} />
        </View>
      )}

      {onPress && (
        <View style={s.arrow}>
          <Ionicons name="chevron-forward" size={14} color="#A89D8E" />
        </View>
      )}
    </Wrap>
  );
}

const s = StyleSheet.create({
  card: {
    flex:            1,
    backgroundColor: '#FFFFFF',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    padding:         16,
    minHeight:       130,
    ...SHADOW,
  },
  iconWrap: {
    width:           40,
    height:          40,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    12,
  },
  value: {
    fontSize:    28,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  label: {
    fontSize:   12,
    fontWeight: '500',
    color:      '#6E6358',
    lineHeight: 17,
  },
  subtitle: {
    fontSize:   11,
    color:      '#A89D8E',
    marginTop:   4,
  },
  barTrack: {
    height:          4,
    backgroundColor: '#F2EBDF',
    borderRadius:    2,
    marginTop:       10,
    overflow:        'hidden',
  },
  barFill: {
    height:       4,
    borderRadius: 2,
  },
  arrow: {
    position:   'absolute',
    bottom:     12,
    right:      12,
  },
});