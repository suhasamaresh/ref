import React from 'react';
import {
  SafeAreaView, StyleSheet, ScrollView, View, Text, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

import ProfileHeader from '../../components/profile/ProfileHeader';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

function SettingRow({ icon, label, onPress, color = '#2C2620' }: SettingRowProps) {
  return (
    <TouchableOpacity style={r.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[r.rowIcon, { backgroundColor: '#F2EBDF' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[r.rowLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A89D8E" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.screenTitle}>{t('profile.title') || 'Profile'}</Text>
        <ProfileHeader onEditPress={() => navigation.navigate('EditProfile')} />

        {/* Account settings */}
        <Text style={s.sectionLabel}>{t('profile.accountSettings') || 'Account settings'}</Text>
        <View style={s.section}>
          <SettingRow icon="create-outline"   label={t('profile.editProfile')    || 'Edit profile'}   onPress={() => navigation.navigate('EditProfile')} />
          <View style={s.divider} />
          <SettingRow icon="lock-closed-outline" label={t('profile.changePassword') || 'Change password'} onPress={() => navigation.navigate('ChangePassword')} />
          <View style={s.divider} />
          <SettingRow icon="language-outline" label={t('profile.language')       || 'Language'}       onPress={() => navigation.navigate('Language')} />
          <View style={s.divider} />
          <SettingRow icon="settings-outline" label={t('common.settings')        || 'Settings'}       onPress={() => navigation.navigate('Settings')} />
        </View>

        {/* Identity & documents */}
        <Text style={s.sectionLabel}>{t('identity.title') || 'Identity'}</Text>
        <View style={s.section}>
          <SettingRow icon="document-text-outline" label={t('identity.uploadDocuments') || 'Upload documents'} onPress={() => navigation.navigate('Identity', { screen: 'DocumentUpload' })} />
          <View style={s.divider} />
          <SettingRow icon="shield-checkmark-outline" label={t('identity.verificationStatus') || 'Verification status'} onPress={() => navigation.navigate('Identity')} />
        </View>

        {/* Support */}
        <Text style={s.sectionLabel}>{t('profile.support') || 'Support'}</Text>
        <View style={s.section}>
          <SettingRow icon="help-circle-outline" label={t('common.help')  || 'Help'}  onPress={() => {}} />
          <View style={s.divider} />
          <SettingRow icon="information-circle-outline" label={t('common.about') || 'About'} onPress={() => navigation.navigate('About')} />
        </View>

        {/* Log out */}
        <View style={s.section}>
          <SettingRow
            icon="log-out-outline"
            label={t('common.logout') || 'Log out'}
            onPress={() => {}}
            color="#B3492E"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FAF6F0' },
  scroll:       { flex: 1 },
  content:      { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  screenTitle:  { fontSize: 22, fontWeight: '700', color: '#2C2620', marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#A89D8E', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 24, marginBottom: 8 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    borderWidth:      1,
    borderColor:     '#E8DECF',
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.05,
    shadowRadius:    10,
    elevation:       2,
  },
  divider:      { height: 1, backgroundColor: '#F2EBDF', marginHorizontal: 56 },
});

const r = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  rowIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginEnd: 14 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});