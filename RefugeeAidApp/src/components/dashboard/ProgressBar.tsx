import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  height = 8,
  color,
  backgroundColor,
  showPercentage = true,
  label,
  animated = true,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  const resolvedProgressColor = (color || theme.colors.primary[500]) as string;
  const resolvedTrackColor = (backgroundColor || theme.colors.gray[100]) as string;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated]);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
    },
    percentage: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    track: {
      width: '100%',
      height: height,
      backgroundColor: resolvedTrackColor,
      borderRadius: height / 2,
      overflow: 'hidden',
    },
    progress: {
      height: '100%',
      backgroundColor: resolvedProgressColor,
      borderRadius: height / 2,
    },
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}
      
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.progress,
            { width: progressWidth },
          ]}
        />
      </View>
    </View>
  );
}
