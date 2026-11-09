import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { identityService } from '../../services/identityService';
import { Document } from '../../types/identity.types';
import { formatDate, formatFileSize } from '../../utils/helpers';

import Header  from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import Card    from '../../components/common/Card';
import Button  from '../../components/common/Button';
import Badge   from '../../components/common/Badge';

export default function DocumentDetailScreen({ route, navigation }: any) {
  const { documentId } = route.params || {};
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await identityService.getDocument(documentId);
        setDoc((res as any).data || res);
      } catch (err) {
        Alert.alert(t('common.error') || 'Error', 'Could not load document.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    if (documentId) load();
  }, [documentId]);

  const handleDelete = () => {
    Alert.alert(t('common.confirm') || 'Confirm', 'Delete this document?', [
      { text: t('common.cancel') || 'Cancel', style: 'cancel' },
      {
        text: t('common.delete') || 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await identityService.deleteDocument(documentId);
            navigation.goBack();
          } catch (err) {
            Alert.alert(t('common.error') || 'Error', 'Failed to delete.');
          }
        },
      },
    ]);
  };

  if (loading) return <Loading visible={true} text="Loading..." />;
  if (!doc) return null;

  const statusVariant =
    doc.status === 'verified' || doc.status === 'approved' ? 'success' :
    doc.status === 'rejected' ? 'error' : 'warning';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header title="Document Details" showBackButton />
      
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Card padding="md">
          {doc.publicUrl ? (
            <Image source={{ uri: doc.publicUrl }} style={s.image} resizeMode="cover" />
          ) : (
            <View style={s.imagePlaceholder}>
              <Text style={s.imgText}>No Preview</Text>
            </View>
          )}

          <Text style={s.title}>{doc.originalName || doc.fileName}</Text>
          
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Type</Text>
            <Text style={s.infoVal}>{t(`identity.documentTypes.${doc.type}`) || doc.type}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Uploaded</Text>
            <Text style={s.infoVal}>{formatDate(doc.uploadedAt, 'short')}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Size</Text>
            <Text style={s.infoVal}>{formatFileSize(doc.fileSize)}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Status</Text>
            <Badge variant={statusVariant} size="sm">
              {t(`identity.${doc.status}`) || doc.status}
            </Badge>
          </View>

          <Button
            title={t('common.delete') || 'Delete'}
            variant="danger"
            onPress={handleDelete}
            style={{ marginTop: 24 }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:    { flex: 1 },
  content:   { padding: 20, paddingBottom: 40 },
  image: {
    width:        '100%',
    height:       220,
    borderRadius: 14,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width:        '100%',
    height:       220,
    borderRadius: 14,
    backgroundColor: '#F2EBDF',
    alignItems:   'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  imgText: {
    color: '#A89D8E',
    fontWeight: '500',
  },
  title: {
    fontSize:    18,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EBDF',
  },
  infoLabel: {
    fontSize: 14,
    color:    '#6E6358',
  },
  infoVal: {
    fontSize:   14,
    fontWeight: '600',
    color:      '#2C2620',
  },
});
