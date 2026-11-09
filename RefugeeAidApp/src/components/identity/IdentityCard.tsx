import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types/auth.types';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius } from '../../theme';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/helpers';

interface IdentityCardProps {
  user: User;
  showQRCode?: boolean;
  onQRPress?: () => void;
  onPress?: () => void;
}

export default function IdentityCard({
  user,
  showQRCode = false,
  onQRPress,
  onPress,
}: IdentityCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.primary[500],
      margin: 0,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.inverse,
    },
    qrButton: {
      padding: theme.spacing.xs,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'nowrap',
    },
    avatarContainer: {
      marginRight: theme.spacing.md,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.primary[50],
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.lg,
    },
    avatarText: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary[500],
    },
    userInfo: {
      flex: 1,
      flexShrink: 1,
    },
    name: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.inverse,
      marginBottom: theme.spacing.xs,
      flexShrink: 1,
    },
    email: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary[100],
      marginBottom: theme.spacing.sm,
      flexShrink: 1,
    },
    statusContainer: {
      marginBottom: theme.spacing.sm,
    },
    idNumber: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary[100],
      fontFamily: 'monospace',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.primary[600],
    },
    validText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.inverse,
    },
    issueDate: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.inverse,
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.card} shadow="large" padding="lg">
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('identity.digitalId')}
          </Text>
          {showQRCode && onQRPress && (
            <TouchableOpacity style={styles.qrButton} onPress={onQRPress}>
              <Ionicons 
                name="qr-code-outline" 
                size={24} 
                color={theme.colors.text.inverse} 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(user.name)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            
            <View style={styles.statusContainer}>
              <Badge
                variant={getStatusColor(user.verificationStatus) as any}
                size="sm"
              >
                {t(`identity.${user.verificationStatus}`)}
              </Badge>
            </View>

            <Text style={styles.idNumber}>
              ID: {(user.id || user._id || 'UNKNOWN').toString().slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.validText}>
            {user.isVerified ? t('identity.verified') : t('identity.pending')}
          </Text>
          <Text style={styles.issueDate}>
            {t('identity.issued')}: {formatDate(user.createdAt, 'short')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
