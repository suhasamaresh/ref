import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Formik } from 'formik';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../utils/validators';
import { Ionicons } from '@expo/vector-icons';

import Input from '../common/Input';
import Button from '../common/Button';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginPress?: () => void;
}

export default function RegisterForm({
  onSuccess,
  onLoginPress,
}: RegisterFormProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  };

  const handleRegister = async (values: typeof initialValues) => {
    console.log('RegisterForm: handleRegister called', values);
    try {
      // quick UI alert to confirm submit was triggered
      try { Alert.alert('Debug', 'Register submit pressed'); } catch (e) {}
      await register(values.name, values.email, values.password, values.phoneNumber);
      console.log('RegisterForm: register() resolved, calling onSuccess');
      onSuccess?.();
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || t('auth.registerError')
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    scrollContainer: {
      flexGrow: 1,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    nameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    nameInput: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.lg,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: 4,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkedCheckbox: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.primary[500],
    },
    termsText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
    termsLink: {
      color: theme.colors.primary[500],
      fontWeight: theme.typography.fontWeight.medium,
    },
    registerButton: {
      marginBottom: theme.spacing.lg,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={initialValues}
        validationSchema={registerSchema}
        onSubmit={handleRegister}
      >
  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue, validateForm }) => {
          // Debug Formik state to understand why submit might be blocked
          console.log('Formik state', { values, errors, touched, isSubmitting });
          return (
          <View style={styles.container}>
            <View style={styles.section}>
              <Input
                label={t('common.name')}
                placeholder={t('auth.enterFullName')}
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={touched.name ? errors.name : undefined}
                autoCapitalize="words"
                leftIcon={
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={theme.colors.text.secondary} 
                  />
                }
                required
              />

              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <Input
                    label={t('common.firstName')}
                    placeholder={t('auth.firstName')}
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={touched.firstName ? errors.firstName : undefined}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.nameInput}>
                  <Input
                    label={t('common.lastName')}
                    placeholder={t('auth.lastName')}
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={touched.lastName ? errors.lastName : undefined}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
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
                label={t('common.phone')}
                placeholder={t('auth.enterPhone')}
                value={values.phoneNumber}
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                error={touched.phoneNumber ? errors.phoneNumber : undefined}
                keyboardType="phone-pad"
                leftIcon={
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={theme.colors.text.secondary} 
                  />
                }
              />
            </View>

            <View style={styles.section}>
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

              <Input
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                secureTextEntry={!showConfirmPassword}
                leftIcon={
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={theme.colors.text.secondary} 
                  />
                }
                rightIcon={
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={theme.colors.text.secondary} 
                  />
                }
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                required
              />
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[styles.checkbox, values.acceptedTerms ? styles.checkedCheckbox : undefined]}
                onPress={() => setFieldValue('acceptedTerms', !values.acceptedTerms)}
              >
                {values.acceptedTerms && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.termsText} onPress={() => setFieldValue('acceptedTerms', !values.acceptedTerms)}>
                {t('auth.acceptTerms')}
              </Text>
            </View>

            {touched.acceptedTerms && errors.acceptedTerms ? (
              <Text style={{ color: theme.colors.error[500], marginBottom: theme.spacing.sm }}>{(errors as any).acceptedTerms}</Text>
            ) : null}

            <Button
              title={t('common.register')}
              onPress={async () => {
                try {
                  const validationErrors = await validateForm();
                  console.log('Formik.validateForm errors on submit attempt:', validationErrors);
                  if (validationErrors && Object.keys(validationErrors).length > 0) {
                    // Surface first validation error
                    const firstKey = Object.keys(validationErrors)[0];
                    const firstError = (validationErrors as any)[firstKey];
                    try { Alert.alert('Validation error', firstError); } catch (e) {}
                    return;
                  }
                  // No validation errors — proceed to submit
                  handleSubmit();
                } catch (e) {
                  console.error('Error during validation before submit:', e);
                  handleSubmit();
                }
              }}
              loading={isSubmitting}
              fullWidth
              style={styles.registerButton}
              testID="register-button"
            />

            {onLoginPress && (
              <Button
                title={t('auth.alreadyHaveAccount')}
                onPress={onLoginPress}
                variant="outline"
                fullWidth
              />
            )}
          </View>
          );
        }}
      </Formik>
    </ScrollView>
  );
}
