import React, { useState } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/authService';

import Header from '../../components/common/Header';
import Input  from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card   from '../../components/common/Card';

export default function ChangePasswordScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authService.changePassword(values);
      Alert.alert(t('common.success') || 'Success', t('auth.passwordChanged') || 'Password changed.');
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error') || 'Error', t('errors.saveError') || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header title={t('settings.changePassword') || 'Change Password'} showBackButton />
      
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Card padding="lg">
          <Input
            label={t('auth.currentPassword') || 'Current Password'}
            value={values.currentPassword}
            onChangeText={(v) => setValues({ ...values, currentPassword: v })}
            secureTextEntry
          />
          <Input
            label={t('auth.newPassword') || 'New Password'}
            value={values.newPassword}
            onChangeText={(v) => setValues({ ...values, newPassword: v })}
            secureTextEntry
          />
          <Input
            label={t('auth.confirmPassword') || 'Confirm Password'}
            value={values.confirmPassword}
            onChangeText={(v) => setValues({ ...values, confirmPassword: v })}
            secureTextEntry
          />
          <Button
            title={t('common.save') || 'Save'}
            onPress={handleSubmit}
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
