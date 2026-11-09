import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius } from '../../theme';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  resendText?: string;
  error?: string;
}

export default function OTPInput({
  length = 6,
  onComplete,
  onResend,
  resendText,
  error,
}: OTPInputProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    
    if (text.length > 1) {
      // Handle paste
      const pastedText = text.slice(0, length);
      for (let i = 0; i < pastedText.length; i++) {
        newOtp[i] = pastedText[i];
      }
      setOtp(newOtp);
      
      const nextIndex = Math.min(pastedText.length, length - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      
      if (pastedText.length === length) {
        onComplete(pastedText);
      }
    } else {
      // Handle single character input
      newOtp[index] = text;
      setOtp(newOtp);
      
      if (text && index < length - 1) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
      
      if (newOtp.join('').length === length) {
        onComplete(newOtp.join(''));
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: theme.spacing.md,
    },
    input: {
      width: 45,
      height: 50,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: borderRadius.md,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surface,
    },
    activeInput: {
      borderColor: theme.colors.primary[500],
    },
    filledInput: {
      borderColor: theme.colors.success[500],
      backgroundColor: theme.colors.success[50],
    },
    errorInput: {
      borderColor: theme.colors.error[500],
    },
    errorText: {
      color: theme.colors.error[500],
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    resendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    resendText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.xs,
    },
    resendButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    resendButtonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary[500],
      fontWeight: theme.typography.fontWeight.medium,
    },
  });

  const getInputStyle = (index: number) => {
    // Start with the base input style. Use `any[]` to allow pushing
    // partial style objects (activeInput, filledInput, errorInput)
    // without TypeScript complaining about missing properties.
    const style: any[] = [styles.input];

    if (index === activeIndex) {
      style.push(styles.activeInput);
    }

    if (otp[index]) {
      style.push(styles.filledInput);
    }

    if (error) {
      style.push(styles.errorInput);
    }

    return style as any;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {Array.from({ length }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={getInputStyle(index)}
            value={otp[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => setActiveIndex(index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {onResend && (
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {resendText || t('auth.didntReceiveCode')}
          </Text>
          <TouchableOpacity style={styles.resendButton} onPress={onResend}>
            <Text style={styles.resendButtonText}>
              {t('auth.resendCode')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
