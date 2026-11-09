import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/common/Button';

export default function QRScannerScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    Alert.alert(t('identity.qrScanned'), data, [
      { text: t('common.ok'), onPress: () => navigation.goBack() },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
  });

  if (permission === null) return <View />;
  if (!permission) return <View />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {permission.granted === false ? (
        <>
          <Text style={styles.info}>{t('errors.cameraPermission')}</Text>
          <Button title={t('common.ok')} onPress={() => navigation.goBack()} />
        </>
      ) : (
        <>
          <Text style={styles.info}>{t('identity.qrScannerPlaceholder')}</Text>
          <Button title={t('common.close')} onPress={() => navigation.goBack()} />
        </>
      )}
    </SafeAreaView>
  );
}
