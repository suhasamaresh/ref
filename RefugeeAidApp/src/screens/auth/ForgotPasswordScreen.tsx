import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Formik } from 'formik';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { forgotPasswordSchema } from '../../utils/validators';
import { authService } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
      justifyContent: 'center',
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    try {
      await authService.forgotPassword({ email: values.email });
      Alert.alert(t('auth.passwordResetSentTitle'), t('auth.passwordResetSentMessage'));
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Forgot password error', error);
      Alert.alert(t('common.error'), error?.message || t('auth.passwordResetFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</Text>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <>
                <Input
                  label={t('auth.email')}
                  placeholder={t('auth.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  error={touched.email && errors.email ? String(errors.email) : undefined}
                  required
                />

                <Button
                  title={t('auth.sendResetLink')}
                  onPress={() => handleSubmit()}
                  variant="primary"
                  loading={isSubmitting}
                />

                <Button
                  title={t('auth.backToLogin')}
                  onPress={() => navigation.goBack()}
                  variant="ghost"
                  style={{ marginTop: theme.spacing.md }}
                />
              </>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
