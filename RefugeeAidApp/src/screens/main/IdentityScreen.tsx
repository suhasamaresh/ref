import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { identityService } from '../../services/identityService';
import { Document, IdentityVerification } from '../../types/identity.types';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/helpers';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

const STATUS_MAP = {
  approved: { color: '#5C8A52', bg: '#E1ECDB' },
  verified: { color: '#5C8A52', bg: '#E1ECDB' },
  pending:  { color: '#B5651D', bg: '#F3DCB8' },
  rejected: { color: '#B3492E', bg: '#F4DCD3' },
};

export default function IdentityScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [verification, setVerification] = useState<IdentityVerification | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsData, verData] = await Promise.all([
        identityService.getUserDocuments().catch(() => []),
        identityService.getVerificationStatus().catch(() => ({ data: null })),
      ]);
      setDocuments(docsData);
      setVerification(verData.data);
    } catch (error) {
      console.error('Error loading identity data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDocIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const map: Record<string, keyof typeof Ionicons.glyphMap> = {
      passport: 'book-outline', national_id: 'card-outline', health_card: 'medical-outline',
    };
    return map[type] || 'document-outline';
  };

  // Determine current step index (0-3)
  const steps = [
    { label: 'Profile',   done: true },
    { label: 'Documents', done: documents.length > 0 },
    { label: 'Review',    done: verification?.status === 'verified' || verification?.status === 'approved' },
    { label: 'Verified',  done: user?.isVerified || false },
  ];
  
  const currentStepIdx = steps.findIndex(s => !s.done);
  const activeIdx = currentStepIdx === -1 ? 3 : currentStepIdx;

  if (loading) return <Loading visible={true} text={t('common.loading') || 'Loading...'} />;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header
        title={t('identity.title') || 'Identity Verification'}
        subtitle={t('identity.subtitle') || 'Manage your identity documents'}
      />
      
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#B5651D" />}
      >
        {/* Progress Pathway (Signature Element) */}
        <View style={s.pathwayBox}>
          <Text style={s.sectionTitle}>{t('identity.progress') || 'Progress'}</Text>
          <View style={s.pathway}>
            {steps.map((step, i) => {
              const isDone   = step.done;
              const isCurr   = i === activeIdx;
              const isFuture = !isDone && !isCurr;

              const color = isDone ? '#5C8A52' : isCurr ? '#2B6E6B' : '#A89D8E';
              const bg    = isDone ? '#5C8A52' : isCurr ? '#D9EAE8' : '#FAF6F0';
              const border = isCurr || isFuture ? color : 'transparent';
              
              return (
                <View key={i} style={s.pathNodeWrap}>
                  <View style={[s.pathNode, { backgroundColor: bg, borderColor: border }]}>
                    {isDone ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : isCurr ? (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2B6E6B' }} />
                    ) : (
                      <Ionicons name="lock-closed" size={12} color="#A89D8E" />
                    )}
                  </View>
                  <Text style={[s.pathLabel, { color: isCurr ? '#2B6E6B' : isDone ? '#2C2620' : '#A89D8E' }]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}

            {/* Connecting lines */}
            <View style={[s.pathLine, { left: 40, width: '25%', backgroundColor: steps[1].done ? '#5C8A52' : '#E8DECF' }]} />
            <View style={[s.pathLine, { left: '38%', width: '25%', backgroundColor: steps[2].done ? '#5C8A52' : '#E8DECF' }]} />
            <View style={[s.pathLine, { left: '71%', width: '20%', backgroundColor: steps[3].done ? '#5C8A52' : '#E8DECF' }]} />
          </View>
        </View>

        <Text style={s.sectionTitle}>{t('identity.yourDocuments') || 'Your Documents'}</Text>

        {documents.length > 0 && (
          <Button
            title={t('identity.uploadDocument') || 'Upload Document'}
            onPress={() => navigation.navigate('DocumentUpload')}
            style={{ marginBottom: 16 }}
          />
        )}

        {documents.length === 0 ? (
          <EmptyState
            icon="document-outline"
            title={t('identity.noDocuments') || 'No documents yet'}
            description={t('identity.uploadFirstDocument') || 'Add your first document to get started.'}
            actionText={t('identity.uploadDocument') || 'Upload Document'}
            onAction={() => navigation.navigate('DocumentUpload')}
          />
        ) : (
          documents.map(doc => {
            const st = STATUS_MAP[doc.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;
            return (
              <TouchableOpacity
                key={doc.id}
                style={s.docCard}
                onPress={() => navigation.navigate('DocumentDetail', { documentId: doc.id })}
                activeOpacity={0.8}
              >
                <View style={[s.docIcon, { backgroundColor: st.bg }]}>
                  <Ionicons name={getDocIcon(doc.type)} size={20} color={st.color} />
                </View>
                <View style={s.docInfo}>
                  <Text style={s.docName}>{t(`identity.documentTypes.${doc.type}`) || doc.type}</Text>
                  <Text style={s.docDate}>{formatDate(doc.uploadedAt, 'short')}</Text>
                </View>
                <View style={[s.pill, { backgroundColor: st.bg }]}>
                  <Text style={[s.pillText, { color: st.color }]}>
                    {t(`identity.${doc.status}`) || doc.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:    { flex: 1 },
  content:   { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize:    18,
    fontWeight:  '600',
    color:       '#2C2620',
    marginBottom: 16,
  },
  pathwayBox: {
    backgroundColor: '#FFFFFF',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    padding:         20,
    marginBottom:    24,
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.06,
    shadowRadius:    12,
    elevation:       2,
  },
  pathway: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    position:       'relative',
    marginTop:      8,
  },
  pathNodeWrap: {
    alignItems: 'center',
    zIndex:     2,
    width:      60,
  },
  pathNode: {
    width:          24,
    height:         24,
    borderRadius:   12,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   8,
  },
  pathLabel: {
    fontSize:   12,
    fontWeight: '500',
    textAlign:  'center',
  },
  pathLine: {
    position: 'absolute',
    top:      11,
    height:   2,
    zIndex:   1,
  },
  docCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    padding:         16,
    marginBottom:    12,
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.04,
    shadowRadius:    8,
    elevation:       1,
  },
  docIcon: {
    width:          40,
    height:         40,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    marginEnd:      12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize:   16,
    fontWeight: '600',
    color:      '#2C2620',
    marginBottom: 2,
  },
  docDate: {
    fontSize: 13,
    color:    '#A89D8E',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderRadius:      999,
  },
  pillText: {
    fontSize:   12,
    fontWeight: '600',
  },
});
