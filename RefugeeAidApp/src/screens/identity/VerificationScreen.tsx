import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { identityService } from '../../services/identityService';

import Header  from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import Card    from '../../components/common/Card';
import Button  from '../../components/common/Button';

export default function VerificationScreen() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await identityService.getVerificationStatus();
        setVerification((res as any).data || res);
      } catch (err) {
        console.error('Error loading verification', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    try {
      await identityService.submitForVerification();
      Alert.alert(t('identity.submitted') || 'Submitted', 'Your profile is now under review.');
    } catch (err) {
      Alert.alert(t('common.error') || 'Error', 'Failed to submit.');
    }
  };

  if (loading) return <Loading visible={true} text="Loading..." />;

  const status = verification?.status || 'Unknown';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header title="Verification Status" showBackButton />
      
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Card padding="lg">
          <Text style={s.label}>Current Status</Text>
          <Text style={s.val}>{t(`identity.${status}`) || status}</Text>

          <Button
            title={t('identity.submitForVerification') || 'Submit for Verification'}
            onPress={handleSubmit}
            style={{ marginTop: 24 }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:    { flex: 1 },
  content:   { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 13,
    color:    '#6E6358',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  val: {
    fontSize:   22,
    fontWeight: '700',
    color:      '#2C2620',
  },
});
