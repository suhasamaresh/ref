import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isInitialized, isAuthenticated } = useAuth();
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // SplashScreen intentionally does not perform navigation itself. The
  // parent `AppNavigator` will render this component while initialization
  // completes, then mount the NavigationContainer with the appropriate
  // initial route. Avoid calling navigation hooks here because this
  // component is rendered before a NavigationContainer exists.

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary[500],
    },
    content: {
      alignItems: 'center',
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary[50],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.inverse,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.inverse,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    version: {
      position: 'absolute',
      bottom: theme.spacing.xl,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.inverse,
    },
    devControls: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      right: 20,
      alignItems: 'center',
    },
    devLabel: {
      color: theme.colors.text.inverse,
      marginBottom: 8,
      fontSize: 12,
    },
    devButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionRow: {
      position: 'absolute',
      bottom: 100,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <>
  <StatusBar backgroundColor={theme.colors.primary[500]} barStyle="light-content" />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="shield-checkmark"
              size={60}
              color={theme.colors.text.inverse}
            />
          </View>
          
          <Text style={styles.title}>
            AI Refugee Aid
          </Text>
          
          <Text style={styles.subtitle}>
            {t('app.tagline')}
          </Text>
        </Animated.View>

        <Text style={styles.version}>v1.0.0</Text>

        <View style={styles.actionRow}>
          <Button
            title="Get started"
            color={theme.colors.surface}
            onPress={() => navigation.replace('Auth')}
          />
          <View style={{ width: 12 }} />
          {__DEV__ && (
            <Button
              title="Explore demo"
              color={theme.colors.surface}
              onPress={async () => {
                try {
                  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, 'DEV_TOKEN');
                  await AsyncStorage.setItem(
                    STORAGE_KEYS.USER,
                    JSON.stringify({ id: 'dev', name: 'Dev User', email: 'dev@example.com' })
                  );
                } catch (e) {
                  console.error('Error setting dev auth keys', e);
                }
                navigation.replace('Main');
              }}
            />
          )}
        </View>
      </View>
    </>
  );
}
