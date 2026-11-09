import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePermissions } from '../../hooks/usePermissions';
import { DocumentType } from '../../types/identity.types';
import { DOCUMENT_TYPES, FILE_CONFIG } from '../../utils/constants';
import { formatFileSize, isAllowedFileType } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius } from '../../theme';

import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface DocumentUploadProps {
  onUpload: (file: any, documentType: DocumentType) => void;
  documentType?: DocumentType;
  loading?: boolean;
}

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export default function DocumentUpload({ 
  onUpload, 
  documentType,
  loading = false,
}: DocumentUploadProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { requestCameraPermission, requestMediaLibraryPermission } = usePermissions();
  
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(documentType || null);
  const [showDocumentTypeModal, setShowDocumentTypeModal] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const documentTypeOptions = Object.entries(DOCUMENT_TYPES).map(([key, value]) => ({
    key: key as DocumentType,
    value,
  }));

  const handleUploadPress = () => {
    if (!selectedDocumentType) {
      setShowDocumentTypeModal(true);
      return;
    }
    setShowUploadOptions(true);
  };

  const handleDocumentTypeSelect = (type: DocumentType) => {
    setSelectedDocumentType(type);
    setShowDocumentTypeModal(false);
    setShowUploadOptions(true);
  };

  const handleCamera = async () => {
    setShowUploadOptions(false);
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        t('common.error'),
        t('errors.cameraPermission')
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || `document_${Date.now()}.jpg`,
          type: asset.type ? `${asset.type}/jpeg` : 'image/jpeg',
          size: (asset.fileSize ?? asset.fileSize) || 0,
        });
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.cameraError'));
    }
  };

  const handleGallery = async () => {
    setShowUploadOptions(false);
    
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert(
        t('common.error'),
        t('errors.galleryPermission')
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || `document_${Date.now()}.jpg`,
          type: asset.type ? `${asset.type}/jpeg` : 'image/jpeg',
          size: asset.fileSize || 0,
        });
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.galleryError'));
    }
  };

  const handleFilePicker = async () => {
    setShowUploadOptions(false);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        // Cast to `any` to avoid readonly tuple vs mutable array typing issues.
        type: FILE_CONFIG.ALLOWED_TYPES as any,
        copyToCacheDirectory: true,
      });

      // document-picker can return different shapes; check for `uri` to detect success
      if ((result as any).uri) {
        // Treat the result as any so we can safely access uri/name/mimeType/size
        const asset: any = result;

        if (!isAllowedFileType((asset.mimeType as string) || '')) {
          Alert.alert(
            t('common.error'),
            t('errors.invalidFileType')
          );
          return;
        }

        if (asset.size && asset.size > FILE_CONFIG.MAX_SIZE) {
          Alert.alert(
            t('common.error'),
            t('errors.fileTooLarge')
          );
          return;
        }

        setSelectedFile({
          uri: asset.uri as string,
          name: asset.name || `document_${Date.now()}`,
          type: (asset.mimeType as string) || 'application/pdf',
          size: asset.size || 0,
        });
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.filePickerError'));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocumentType) {
      Alert.alert(
        t('common.error'),
        !selectedFile ? t('identity.selectFile') : t('identity.selectDocumentType')
      );
      return;
    }

    try {
      await onUpload(selectedFile, selectedDocumentType);
      setSelectedFile(null);
      setSelectedDocumentType(documentType || null);
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || t('errors.uploadError')
      );
    }
  };

  const isImage = selectedFile?.type.startsWith('image/');

  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    uploadArea: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: borderRadius.lg,
      padding: theme.spacing.xl,
      alignItems: 'center',
      backgroundColor: theme.colors.gray[50],
      marginBottom: theme.spacing.lg,
    },
    uploadAreaActive: {
      borderColor: theme.colors.primary[500],
      backgroundColor: theme.colors.primary[50],
    },
    uploadIcon: {
      marginBottom: theme.spacing.md,
    },
    uploadTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    uploadSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    documentTypeSelector: {
      marginBottom: theme.spacing.lg,
    },
    selectedDocumentType: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.primary[50],
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary[500],
    },
    documentTypeText: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.primary[700],
    },
    selectedFileContainer: {
      backgroundColor: theme.colors.gray[100],
      borderRadius: borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    selectedFileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    fileName: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      flex: 1,
      flexShrink: 1,
    },
    removeButton: {
      padding: theme.spacing.xs,
    },
    fileInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    fileType: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    fileSize: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    imagePreview: {
      width: '100%',
      height: 150,
      borderRadius: borderRadius.md,
      backgroundColor: theme.colors.gray[100],
      maxWidth: '100%',
    },
    modalContent: {
      padding: theme.spacing.lg,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionIcon: {
      marginRight: theme.spacing.md,
    },
    optionText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('identity.uploadDocument')}</Text>
      
      {!selectedDocumentType && (
        <View style={styles.documentTypeSelector}>
          <Button
            title={t('identity.selectDocumentType')}
            onPress={() => setShowDocumentTypeModal(true)}
            variant="outline"
            fullWidth
            icon={<Ionicons name="document-outline" size={20} />}
          />
        </View>
      )}

      {selectedDocumentType && (
        <TouchableOpacity
          style={styles.selectedDocumentType}
          onPress={() => setShowDocumentTypeModal(true)}
        >
          <Text style={styles.documentTypeText}>
            {DOCUMENT_TYPES[selectedDocumentType]}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.uploadArea, selectedFile && styles.uploadAreaActive]}
        onPress={handleUploadPress}
        disabled={loading}
      >
        <View style={styles.uploadIcon}>
          <Ionicons 
            name={selectedFile ? "document-text" : "cloud-upload-outline"} 
            size={48} 
          color={selectedFile ? theme.colors.primary[500] : theme.colors.text.secondary} 
          />
        </View>
        <Text style={styles.uploadTitle}>
          {selectedFile ? t('identity.documentSelected') : t('identity.selectDocument')}
        </Text>
        <Text style={styles.uploadSubtitle}>
          {selectedFile 
            ? t('identity.tapToChangeDocument')
            : t('identity.uploadInstructions')
          }
        </Text>
      </TouchableOpacity>

      {selectedFile && (
        <View style={styles.selectedFileContainer}>
          <View style={styles.selectedFileHeader}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setSelectedFile(null)}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.error[500]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.fileInfo}>
            <Text style={styles.fileType}>{selectedFile.type}</Text>
            {selectedFile.size && (
              <Text style={styles.fileSize}>
                {formatFileSize(selectedFile.size)}
              </Text>
            )}
          </View>

          {isImage && (
            <Image 
              source={{ uri: selectedFile.uri }} 
              style={styles.imagePreview}
              resizeMode="cover"
            />
          )}
        </View>
      )}

      <Button
        title={t('identity.uploadDocument')}
        onPress={handleUpload}
        loading={loading}
        disabled={!selectedFile || !selectedDocumentType}
        fullWidth
      />

      {/* Document Type Selection Modal */}
      <Modal
        visible={showDocumentTypeModal}
        onClose={() => setShowDocumentTypeModal(false)}
        position="bottom"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('identity.selectDocumentType')}</Text>
          {documentTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.optionButton}
              onPress={() => handleDocumentTypeSelect(option.key)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="document-outline" size={20} color={theme.colors.text.secondary} />
              </View>
              <Text style={styles.optionText}>{option.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Upload Options Modal */}
      <Modal
        visible={showUploadOptions}
        onClose={() => setShowUploadOptions(false)}
        position="bottom"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('identity.selectUploadMethod')}</Text>
          
          <TouchableOpacity style={styles.optionButton} onPress={handleCamera}>
            <View style={styles.optionIcon}>
              <Ionicons name="camera-outline" size={20} color={theme.colors.text.secondary} />
            </View>
            <Text style={styles.optionText}>{t('identity.takePhoto')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleGallery}>
            <View style={styles.optionIcon}>
              <Ionicons name="images-outline" size={20} color={theme.colors.text.secondary} />
            </View>
            <Text style={styles.optionText}>{t('identity.selectFromGallery')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleFilePicker}>
            <View style={styles.optionIcon}>
              <Ionicons name="document-outline" size={20} color={theme.colors.text.secondary} />
            </View>
            <Text style={styles.optionText}>{t('identity.selectFile')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
