import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand header */}
          <View style={s.brand}>
            <View style={s.iconWrap}>
              <Ionicons name="shield-checkmark" size={36} color="#B5651D" />
            </View>
            <Text style={s.appName}>Refugee Aid</Text>
            <Text style={s.tagline}>Secure. Private. Trusted.</Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
            <Text style={s.title}>{t('auth.loginTitle')}</Text>
            <Text style={s.subtitle}>{t('auth.loginSubtitle')}</Text>
            <LoginForm
              onSuccess={() => navigation.replace('Main')}
              onRegisterPress={() => navigation.navigate('Register')}
              onForgotPasswordPress={() => navigation.navigate('ForgotPassword')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex:      { flex: 1 },
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:    { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  brand: {
    alignItems:  'center',
    paddingTop:   52,
    paddingBottom: 36,
  },
  iconWrap: {
    width:           80,
    height:          80,
    borderRadius:    40,
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
  appName: {
    fontSize:    24,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color:    '#A89D8E',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    24,
    padding:         24,
    borderWidth:      1,
    borderColor:     '#E8DECF',
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.06,
    shadowRadius:    16,
    elevation:       2,
  },
  title: {
    fontSize:    22,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 6,
  },
  subtitle: {
    fontSize:    14,
    color:       '#6E6358',
    marginBottom: 24,
  },
});