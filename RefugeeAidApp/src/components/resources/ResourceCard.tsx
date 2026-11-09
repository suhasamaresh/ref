import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Resource } from '../../types/resource.types';
import { Ionicons } from '@expo/vector-icons';
// borderRadius removed (not used)
import Card from '../common/Card';
import Badge from '../common/Badge';

interface ResourceCardProps {
  resource: Resource;
  onPress: () => void;
  onFavoritePress?: () => void;
  showDistance?: boolean;
  distance?: number;
}

export default function ResourceCard({
  resource,
  onPress,
  onFavoritePress,
  showDistance = false,
  distance,
}: ResourceCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      housing: theme.colors.primary[500],
      employment: theme.colors.success[500],
      legal: theme.colors.warning[500],
      healthcare: theme.colors.error[500],
      education: theme.colors.info[500],
      food: theme.colors.secondary[500],
    };
    return colors[category] || theme.colors.gray[100];
  };

  const formatDistance = (dist: number) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}km`;
  };

  const styles = StyleSheet.create({
    card: {
      marginBottom: theme.spacing.sm,
    },
    container: {
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    organizationInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
      flexShrink: 1,
    },
    organizationName: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: 2,
      flexShrink: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      lineHeight: 22,
      flexShrink: 1,
    },
    favoriteButton: {
      padding: theme.spacing.xs,
    },
    content: {
      marginBottom: theme.spacing.sm,
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
      flexShrink: 1,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    tag: {
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    locationText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs,
      flex: 1,
    },
    rightInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    distance: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.primary[500],
      marginRight: theme.spacing.sm,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.xs,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
    },
    verifiedText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.success[500],
      marginLeft: 2,
    },
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} shadow="small">
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.organizationInfo}>
              <Text style={styles.organizationName}>
                {resource.organization.name}
              </Text>
              <Text style={styles.title} numberOfLines={2}>
                {resource.title}
              </Text>
            </View>
            
            {onFavoritePress && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={onFavoritePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={resource.isFavorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={resource.isFavorited ? theme.colors.error[500] : theme.colors.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            {resource.description && (
              <Text style={styles.description} numberOfLines={2}>
                {resource.description}
              </Text>
            )}

            <View style={styles.tagsContainer}>
              <Badge
                variant="info"
                size="sm"
                style={{ ...(StyleSheet.flatten(styles.tag) as object), backgroundColor: getCategoryColor(resource.category) + '20' } as any}
              >
                {t(`resources.categories.${resource.category}`)}
              </Badge>
              
              {resource.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="neutral"
                  size="sm"
                  style={styles.tag}
                >
                  {tag}
                </Badge>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={theme.colors.text.secondary}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {resource.location?.address.city || 'Remote'}
              </Text>
            </View>

            <View style={styles.rightInfo}>
              {showDistance && distance !== undefined && (
                <Text style={styles.distance}>
                  {formatDistance(distance)}
                </Text>
              )}

              <View style={styles.rating}>
                <Ionicons
                  name="star"
                  size={16}
                  color={theme.colors.warning[500]}
                />
                <Text style={styles.ratingText}>
                  {resource.rating.toFixed(1)}
                </Text>
              </View>

              {resource.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.success[500]}
                  />
                  <Text style={styles.verifiedText}>
                    {t('resources.verified')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
