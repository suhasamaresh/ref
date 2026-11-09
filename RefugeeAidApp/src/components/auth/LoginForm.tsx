import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validators';
import { Ionicons } from '@expo/vector-icons';

import Input from '../common/Input';
import Button from '../common/Button';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterPress?: () => void;
  onForgotPasswordPress?: () => void;
}

export default function LoginForm({
  onSuccess,
  onRegisterPress,
  onForgotPasswordPress,
}: LoginFormProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values: { email: string; password: string; rememberMe: boolean }) => {
    try {
      await login(values.email, values.password);
      onSuccess?.();
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || t('auth.loginError')
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    forgotPasswordContainer: {
      alignItems: 'flex-end',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    forgotPasswordText: {
      color: theme.colors.primary[500],
      fontSize: theme.typography.fontSize.sm,
    },
    loginButton: {
      marginBottom: theme.spacing.lg,
    },
  });

  return (
    <Formik
      initialValues={{ email: '', password: '', rememberMe: false }}
      validationSchema={loginSchema}
      onSubmit={handleLogin}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
        <View style={styles.container}>
          <Input
            label={t('common.email')}
            placeholder={t('auth.enterEmail')}
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email ? errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={theme.colors.text.secondary} 
              />
            }
            required
          />

          <Input
            label={t('common.password')}
            placeholder={t('auth.enterPassword')}
            value={values.password}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            error={touched.password ? errors.password : undefined}
            secureTextEntry={!showPassword}
            leftIcon={
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={theme.colors.text.secondary} 
              />
            }
            rightIcon={
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={theme.colors.text.secondary} 
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
            required
          />

          {onForgotPasswordPress && (
            <View style={styles.forgotPasswordContainer}>
              <Button
                title={t('auth.forgotPassword')}
                onPress={onForgotPasswordPress}
                variant="ghost"
                size="sm"
              />
            </View>
          )}

          <Button
            title={t('common.login')}
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            style={styles.loginButton}
          />

          {onRegisterPress && (
            <Button
              title={t('auth.dontHaveAccount')}
              onPress={onRegisterPress}
              variant="outline"
              fullWidth
            />
          )}
        </View>
      )}
    </Formik>
  );
}
