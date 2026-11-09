import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

interface AiSearchBarProps {
  onPress: () => void;
}

export default function AiSearchBar({ onPress }: AiSearchBarProps) {
  const { t } = useLanguage();

  return (
    <TouchableOpacity style={s.container} activeOpacity={0.8} onPress={onPress}>
      <View style={s.iconWrap}>
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
      </View>
      <View style={s.textWrap}>
        <Text style={s.title}>Ask AI Assistant</Text>
        <Text style={s.subtitle}>Translate, explain, or find help...</Text>
      </View>
      <View style={s.micWrap}>
        <Ionicons name="mic-outline" size={20} color="#2B6E6B" />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#FFFFFF',
    borderRadius:    20,
    borderWidth:     1.5,
    borderColor:     '#D9EAE8', // Secondary muted
    padding:         12,
    marginBottom:    32,
    shadowColor:     '#2B6E6B',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.05,
    shadowRadius:    12,
    elevation:       2,
  },
  iconWrap: {
    width:          48,
    height:         48,
    borderRadius:   24,
    backgroundColor: '#2B6E6B',
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#2C2620',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color:    '#A89D8E',
  },
  micWrap: {
    width:          40,
    height:         40,
    borderRadius:   20,
    backgroundColor: '#F2EBDF',
    alignItems:     'center',
    justifyContent: 'center',
    marginLeft:     8,
  },
});
