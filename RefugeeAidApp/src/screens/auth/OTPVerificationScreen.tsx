import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/authService';

import Header from '../../components/common/Header';
import OTPInput from '../../components/auth/OTPInput';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

interface RouteParams {
  type: 'email' | 'phone';
  contact: string;
}

export default function OTPVerificationScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const { type, contact } = route.params as RouteParams;
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOTPComplete = async (otp: string) => {
    setLoading(true);
    setError('');
    
    try {
      await authService.verifyOTP({ code: otp, type });
      
      Alert.alert(
        t('common.success'),
        t('auth.verificationSuccess'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.replace('Main'),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || t('auth.invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      await authService.resendOTP(type);
      setTimeLeft(60);
      setCanResend(false);
      
      Alert.alert(
        t('common.success'),
        t('auth.otpResent')
      );
    } catch (err: any) {
      Alert.alert(
        t('common.error'),
        err.message || t('auth.resendError')
      );
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212', // Deep black background
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF', // White for contrast
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      color: '#A3A3A3', // Light gray for secondary text
      textAlign: 'center',
      lineHeight: 24,
    },
    contact: {
      fontWeight: '600',
      color: '#14B8A6', // Emerald green
    },
    otpContainer: {
      marginVertical: 30,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: 30,
    },
    timerText: {
      fontSize: 14,
      color: '#A3A3A3', // Light gray
      marginBottom: 10,
    },
    resendButton: {
      opacity: canResend ? 1 : 0.5,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={t('auth.verification')}
        showBackButton={true}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('auth.otpTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {t('auth.otpSubtitle', { 
              contact: type === 'email' ? contact : `***-***-${contact.slice(-4)}` 
            })}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            error={error}
          />
        </View>

        <View style={styles.resendContainer}>
          {!canResend && (
            <Text style={styles.timerText}>
              {t('auth.resendIn')} {formatTime(timeLeft)}
            </Text>
          )}
          
          <Button
            title={t('auth.resendOTP')}
            onPress={handleResend}
            variant="ghost"
            disabled={!canResend}
            loading={resendLoading}
            style={styles.resendButton}
          />
        </View>
      </View>

      <Loading visible={loading} text={t('auth.verifying')} />
    </SafeAreaView>
  );
}