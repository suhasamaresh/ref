import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';

import WelcomeCard            from '../../components/dashboard/WelcomeCard';
import AiSearchBar            from '../../components/dashboard/AiSearchBar';
import QuickActionGrid        from '../../components/dashboard/QuickActionGrid';
import AiRecommendedResources from '../../components/dashboard/AiRecommendedResources';
import StatsCard              from '../../components/dashboard/StatsCard';
import ChatButton             from '../../components/chat/ChatButton';
import ChatModal              from '../../components/chat/ChatModal';

const AMBER = { main: '#B5651D', muted: '#F3DCB8' };
const TEAL  = { main: '#2B6E6B', muted: '#D9EAE8' };
const SAGE  = { main: '#5C8A52', muted: '#E1ECDB' };

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [stats] = useState({ progress: 75 });

  const quickActions = [
    {
      id: '1',
      title: 'Upload Doc',
      icon: 'document-text' as const,
      color: AMBER.main, mutedColor: AMBER.muted,
      onPress: () => navigation.navigate('Identity', { screen: 'DocumentUpload' }),
    },
    {
      id: '2',
      title: 'Find Help',
      icon: 'search' as const,
      color: TEAL.main, mutedColor: TEAL.muted,
      onPress: () => navigation.navigate('Resources'),
    },
    {
      id: '3',
      title: 'Translate',
      icon: 'language' as const,
      color: SAGE.main, mutedColor: SAGE.muted,
      onPress: () => setChatVisible(true), // Opens AI chat for translation
    },
    {
      id: '4',
      title: 'Updates',
      icon: 'newspaper' as const,
      color: TEAL.main, mutedColor: TEAL.muted,
      onPress: () => navigation.navigate('News'),
    },
  ];

  const recommendations = [
    { id: 'r1', title: 'Downtown Legal Aid Clinic', category: 'Legal Aid', distance: '1.2 miles away' },
    { id: 'r2', title: 'Community Housing Support', category: 'Housing', distance: '2.5 miles away' },
    { id: 'r3', title: 'Free Health Screening', category: 'Healthcare', distance: '3.0 miles away' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#B5651D" />}
      >
        <Text style={s.appLabel}>REFUGEE AID</Text>

        <WelcomeCard onProfilePress={() => navigation.navigate('Profile')} />

        <AiSearchBar onPress={() => setChatVisible(true)} />

        <Text style={s.sectionTitle}>What do you need?</Text>
        <QuickActionGrid actions={quickActions} />

        <AiRecommendedResources
          recommendations={recommendations}
          onPress={(id) => navigation.navigate('Resources')}
        />

        <Text style={s.sectionTitle}>Your Journey</Text>
        <View style={s.statsGrid}>
          <StatsCard
            title="Identity Verification"
            value="In Progress"
            icon="shield-checkmark"
            color={SAGE.main}
            mutedColor={SAGE.muted}
            progress={stats.progress}
            subtitle={`${stats.progress}% complete`}
            onPress={() => navigation.navigate('Identity')}
          />
        </View>

      </ScrollView>

      <ChatButton onPress={() => setChatVisible(true)} />
      <ChatModal visible={chatVisible} onClose={() => setChatVisible(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:    { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop:        12,
    paddingBottom:     148, // FAB clearance
  },
  appLabel: {
    fontSize:    11,
    fontWeight:  '700',
    color:       '#A89D8E',
    letterSpacing: 3,
    textAlign:   'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize:    18,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 16,
  },
  statsGrid: {
    marginBottom: 12,
  },
});
