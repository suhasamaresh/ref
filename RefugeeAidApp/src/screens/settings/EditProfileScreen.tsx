import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { userService } from '../../services/userService';

import Header  from '../../components/common/Header';
import Input   from '../../components/common/Input';
import Button  from '../../components/common/Button';
import Card    from '../../components/common/Card';
import Loading from '../../components/common/Loading';

export default function EditProfileScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [profile, setProfile] = useState<any>({ name: '', email: '', phone: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getProfile();
        const user = (res as any).data || res;
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setInitLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateProfile(profile);
      Alert.alert(t('common.success') || 'Success', t('profile.updated') || 'Profile updated.');
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error') || 'Error', t('errors.saveError') || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) return <Loading visible text="Loading..." />;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header title={t('profile.editProfile') || 'Edit Profile'} showBackButton />
      
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Card padding="lg">
          <Input
            label={t('common.name') || 'Full Name'}
            value={profile.name}
            onChangeText={(v) => setProfile({ ...profile, name: v })}
            placeholder="Enter your name"
          />
          <Input
            label={t('common.email') || 'Email'}
            value={profile.email}
            onChangeText={(v) => setProfile({ ...profile, email: v })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label={t('common.phone') || 'Phone'}
            value={profile.phone}
            onChangeText={(v) => setProfile({ ...profile, phone: v })}
            keyboardType="phone-pad"
          />
          <Button
            title={t('common.save') || 'Save'}
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 24 }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content:   { padding: 20, paddingBottom: 40 },
});
