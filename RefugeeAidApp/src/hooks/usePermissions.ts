import { useState, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface UsePermissions {
  cameraPermission: PermissionStatus;
  mediaLibraryPermission: PermissionStatus;
  locationPermission: PermissionStatus;
  requestCameraPermission: () => Promise<boolean>;
  requestMediaLibraryPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  checkAllPermissions: () => Promise<void>;
  openSettings: () => void;
}

export const usePermissions = (): UsePermissions => {
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('undetermined');
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<PermissionStatus>('undetermined');
  const [locationPermission, setLocationPermission] = useState<PermissionStatus>('undetermined');

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    // Check camera permission
    try {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status);
    } catch (error) {
      console.error('Error checking camera permission:', error);
    }

    // Check media library permission
    try {
      const mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      setMediaLibraryPermission(mediaStatus.status);
    } catch (error) {
      console.error('Error checking media library permission:', error);
    }

    // Check location permission
    try {
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocationPermission(locationStatus.status);
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (cameraPermission === 'granted') {
        return true;
      }

      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status);
      
      if (status === 'denied') {
        showPermissionAlert('Camera', 'take photos of documents for verification');
        return false;
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    try {
      if (mediaLibraryPermission === 'granted') {
        return true;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaLibraryPermission(status);
      
      if (status === 'denied') {
        showPermissionAlert('Photo Library', 'select document images from your gallery');
        return false;
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (locationPermission === 'granted') {
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'denied') {
        showPermissionAlert('Location', 'find nearby resources and services');
        return false;
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const showPermissionAlert = (permissionName: string, purpose: string) => {
    Alert.alert(
      `${permissionName} Permission Required`,
      `This app needs access to your ${permissionName.toLowerCase()} to ${purpose}. Please enable it in Settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ]
    );
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return {
    cameraPermission,
    mediaLibraryPermission,
    locationPermission,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestLocationPermission,
    checkAllPermissions,
    openSettings,
  };
};
