import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';

interface WelcomeCardProps {
  onProfilePress?: () => void;
}

export default function WelcomeCard({ onProfilePress }: WelcomeCardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const name = user?.profile?.firstName || user?.name || 'Friend';
  const initial = name.charAt(0).toUpperCase();

  // Simulated AI Briefing Content
  const aiGreeting = "Good morning, " + name;
  const aiBriefing = "Your passport verification was approved yesterday. You have 2 new local news alerts regarding clinic hours.";

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onProfilePress} style={s.container}>
      <View style={s.headerRow}>
        <View style={s.avatarWrap}>
          <Text style={s.avatarInitial}>{initial}</Text>
        </View>
        <View style={s.greetingWrap}>
          <Text style={s.greetingTitle}>{aiGreeting}</Text>
          <View style={s.pill}>
            <Ionicons name="sparkles" size={12} color="#B5651D" style={{ marginRight: 4 }} />
            <Text style={s.pillText}>AI Daily Briefing</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A89D8E" />
      </View>
      <View style={s.briefingBody}>
        <Text style={s.briefingText}>{aiBriefing}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    padding:         20,
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.06,
    shadowRadius:    12,
    elevation:       2,
    marginBottom:    24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  16,
  },
  avatarWrap: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#F3DCB8',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     16,
  },
  avatarInitial: {
    fontSize:   24,
    fontWeight: '700',
    color:      '#B5651D',
  },
  greetingWrap: {
    flex: 1,
  },
  greetingTitle: {
    fontSize:   22,
    fontWeight: '700',
    color:      '#2C2620',
    marginBottom: 4,
  },
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    alignSelf:         'flex-start',
    backgroundColor:   '#FAF6F0',
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      8,
    borderWidth:       1,
    borderColor:       '#E8DECF',
  },
  pillText: {
    fontSize:   11,
    fontWeight: '600',
    color:      '#B5651D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  briefingBody: {
    backgroundColor: '#FAF6F0',
    padding:         16,
    borderRadius:    12,
  },
  briefingText: {
    fontSize:   15,
    lineHeight: 24,
    color:      '#6E6358',
  },
});