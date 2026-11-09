import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeaderProps {
  onEditPress?: () => void;
  onAvatarPress?: () => void;
}

export default function ProfileHeader({ onEditPress }: ProfileHeaderProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!user) return null;

  const initials = (user.name || 'U')
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const statusColor =
    user.verificationStatus === 'verified' ? '#5C8A52' :
    user.verificationStatus === 'pending'  ? '#B5651D' : '#B3492E';
  const statusBg =
    user.verificationStatus === 'verified' ? '#E1ECDB' :
    user.verificationStatus === 'pending'  ? '#F3DCB8' : '#F4DCD3';
  const statusIcon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap =
    user.verificationStatus === 'verified' ? 'checkmark-circle' :
    user.verificationStatus === 'rejected' ? 'close-circle'     : 'time-outline';
  const statusLabel = t(`identity.${user.verificationStatus}`) || user.verificationStatus;

  return (
    <View style={s.card}>
      {/* Avatar + edit */}
      <View style={s.avatarRow}>
        <View style={s.avatar}>
          <Text style={s.initials}>{initials}</Text>
        </View>
        {onEditPress && (
          <TouchableOpacity style={s.editBtn} onPress={onEditPress} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color="#B5651D" />
          </TouchableOpacity>
        )}
      </View>

      {/* Name & email */}
      <Text style={s.name} numberOfLines={1}>{user.name}</Text>
      <Text style={s.email} numberOfLines={1}>{user.email}</Text>

      {/* Verification status pill */}
      <View style={[s.pill, { backgroundColor: statusBg }]}>
        <Ionicons name={statusIcon} size={14} color={statusColor} />
        <Text style={[s.pillLabel, { color: statusColor }]}>
          {t('profile.verificationStatus')}: {statusLabel}
        </Text>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statValue}>12</Text>
          <Text style={s.statLabel}>{t('profile.documents') || 'Documents'}</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.stat}>
          <Text style={s.statValue}>5</Text>
          <Text style={s.statLabel}>{t('profile.applications') || 'Applications'}</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.stat}>
          <Text style={s.statValue}>8</Text>
          <Text style={s.statLabel}>{t('profile.resources') || 'Resources'}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     '#E8DECF',
    padding:         24,
    alignItems:      'center',
    marginBottom:    24,
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.06,
    shadowRadius:    12,
    elevation:       2,
  },
  avatarRow: {
    position:   'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  avatar: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: '#F3DCB8',
    alignItems:      'center',
    justifyContent:  'center',
  },
  initials: {
    fontSize:   28,
    fontWeight: '700',
    color:      '#B5651D',
  },
  editBtn: {
    position:        'absolute',
    bottom:          0,
    right:           -6,
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: '#FFFFFF',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     '#E8DECF',
    shadowColor:     '#2C2620',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    6,
    elevation:       2,
  },
  name: {
    fontSize:    22,
    fontWeight:  '700',
    color:       '#2C2620',
    textAlign:   'center',
    marginBottom: 4,
  },
  email: {
    fontSize:    14,
    color:       '#6E6358',
    textAlign:   'center',
    marginBottom: 16,
  },
  pill: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical:  6,
    paddingHorizontal: 14,
    borderRadius:    999,
    marginBottom:    24,
    gap:             6,
  },
  pillLabel: {
    fontSize:   13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection:   'row',
    width:           '100%',
    paddingTop:       16,
    borderTopWidth:   1,
    borderTopColor:  '#F2EBDF',
  },
  stat: {
    flex:       1,
    alignItems: 'center',
  },
  statDiv: {
    width:           1,
    backgroundColor: '#F2EBDF',
  },
  statValue: {
    fontSize:    22,
    fontWeight:  '700',
    color:       '#2C2620',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color:    '#6E6358',
  },
});