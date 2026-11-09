import React from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

import RegisterForm from '../../components/auth/RegisterForm';
import Header from '../../components/common/Header';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const auth = useAuth();

  const handleSuccess = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' as any }] }));
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header title={t('auth.registerTitle')} showBackButton />
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <View style={s.iconWrap}>
              <Ionicons name="person-add" size={32} color="#B5651D" />
            </View>
            <Text style={s.title}>{t('auth.createAccount')}</Text>
            <Text style={s.subtitle}>{t('auth.registerSubtitle')}</Text>
          </View>

          <RegisterForm
            onSuccess={handleSuccess}
            onLoginPress={() => navigation.goBack()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex:      { flex: 1 },
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:    { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    alignItems:  'center',
    paddingTop:   24,
    paddingBottom: 28,
  },
  iconWrap: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: '#F3DCB8',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.08,
    shadowRadius:    12,
    elevation:       2,
  },
  title: {
    fontSize:    20,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color:    '#6E6358',
  },
});