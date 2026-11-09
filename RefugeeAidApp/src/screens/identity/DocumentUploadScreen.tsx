import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import { useLanguage } from '../../context/LanguageContext';
import { identityService } from '../../services/identityService';

import Header  from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import Input   from '../../components/common/Input';
import Button  from '../../components/common/Button';
import Card    from '../../components/common/Card';

export default function DocumentUploadScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (values: any) => {
    setLoading(true);
    try {
      const response = await identityService.uploadDocumentWithVerification(values);
      const { verification } = response;
      if (verification.verified) {
        Alert.alert(
          t('identity.uploadSuccess') || 'Document uploaded',
          'Document verified successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          t('identity.verificationFailed') || 'Verification issues',
          'Document uploaded, but has some issues.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      Alert.alert(t('common.error') || 'Error', err?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header title={t('identity.uploadDocument') || 'Upload Document'} showBackButton />
      
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.desc}>
          {t('identity.uploadInstructions') || 'Enter your document details carefully. They must exactly match the physical document.'}
        </Text>

        <Formik
          initialValues={{
            type: '',
            number: '',
            name: '',
            dateOfBirth: '',
            expiryDate: '',
            issuingCountry: '',
          }}
          onSubmit={handleUpload}
        >
          {({ handleChange, handleSubmit, values }) => (
            <Card padding="lg">
              <Text style={s.sectionLabel}>Document Type</Text>
              <Input
                value={values.type}
                onChangeText={handleChange('type')}
                placeholder="e.g. passport, national_id"
              />

              <Text style={[s.sectionLabel, { marginTop: 16 }]}>Document Details</Text>
              <Input
                label="Document Number"
                value={values.number}
                onChangeText={handleChange('number')}
                placeholder="e.g., P1234567"
              />
              <Input
                label="Full Name"
                value={values.name}
                onChangeText={handleChange('name')}
                placeholder="As shown on document"
              />
              <Input
                label="Date of Birth"
                value={values.dateOfBirth}
                onChangeText={handleChange('dateOfBirth')}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Expiry Date"
                value={values.expiryDate}
                onChangeText={handleChange('expiryDate')}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Issuing Country"
                value={values.issuingCountry}
                onChangeText={handleChange('issuingCountry')}
                placeholder="e.g., USA, UK"
              />

              <Button
                title="Verify & Upload"
                onPress={handleSubmit as any}
                loading={loading}
                style={{ marginTop: 24 }}
              />
            </Card>
          )}
        </Formik>
      </ScrollView>
      <Loading visible={loading} text="Uploading..." />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:    { flex: 1 },
  content:   { padding: 20, paddingBottom: 40 },
  desc: {
    fontSize:   14,
    color:      '#6E6358',
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize:     13,
    fontWeight:   '600',
    color:        '#A89D8E',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
