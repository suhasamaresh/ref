import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { usePermissions } from './usePermissions';

interface CameraOptions {
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

interface UseCamera {
  isLoading: boolean;
  launchCamera: (options?: CameraOptions) => Promise<ImagePicker.ImagePickerResult | null>;
  launchImageLibrary: (options?: CameraOptions) => Promise<ImagePicker.ImagePickerResult | null>;
}

export const useCamera = (): UseCamera => {
  const [isLoading, setIsLoading] = useState(false);
  const { requestCameraPermission, requestMediaLibraryPermission } = usePermissions();

  const defaultOptions: CameraOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  };

  const launchCamera = async (options: CameraOptions = {}): Promise<ImagePicker.ImagePickerResult | null> => {
    setIsLoading(true);
    
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestCameraPermissionsAsync() }
          ]
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        ...defaultOptions,
        ...options,
      });

      return result;
    } catch (error) {
      console.error('Camera launch error:', error);
      Alert.alert('Error', 'Failed to launch camera');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const launchImageLibrary = async (options: CameraOptions = {}): Promise<ImagePicker.ImagePickerResult | null> => {
    setIsLoading(true);
    
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select images.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options,
      });

      return result;
    } catch (error) {
      console.error('Image library launch error:', error);
      Alert.alert('Error', 'Failed to launch image library');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    launchCamera,
    launchImageLibrary,
  };
};
