import React from 'react';
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';

export default function SettingsScreen() {
  const { t } = useLanguage();
  const navigation = useNavigation<any>();

  const Row = ({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) => (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={s.iconWrap}>
        <Ionicons name={icon} size={20} color="#2C2620" />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A89D8E" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header title={t('common.settings') || 'Settings'} showBackButton />
      
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Account</Text>
        <View style={s.card}>
          <Row icon="create-outline" label={t('settings.editProfile') || 'Edit Profile'} onPress={() => navigation.navigate('EditProfile')} />
          <View style={s.divider} />
          <Row icon="lock-closed-outline" label={t('settings.changePassword') || 'Change Password'} onPress={() => navigation.navigate('ChangePassword')} />
        </View>

        <Text style={s.sectionTitle}>Preferences</Text>
        <View style={s.card}>
          <Row icon="language-outline" label={t('settings.language') || 'Language'} onPress={() => navigation.navigate('Language')} />
        </View>

        <Text style={s.sectionTitle}>System</Text>
        <View style={s.card}>
          <Row icon="information-circle-outline" label={t('settings.about') || 'About'} onPress={() => navigation.navigate('About')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content:   { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize:    13,
    fontWeight:  '600',
    color:       '#A89D8E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop:   24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.04,
    shadowRadius:    8,
    elevation:       1,
  },
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height:          1,
    backgroundColor: '#F2EBDF',
    marginHorizontal: 56, // indent past icon
  },
  iconWrap: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: '#F2EBDF',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     14,
  },
  rowLabel: {
    flex:       1,
    fontSize:   15,
    fontWeight: '500',
    color:      '#2C2620',
  },
});
