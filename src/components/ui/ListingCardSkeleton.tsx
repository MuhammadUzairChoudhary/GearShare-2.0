import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';

interface ListingCardSkeletonProps {
  testID?: string;
}

export function ListingCardSkeleton({ testID }: ListingCardSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
      testID={testID}
      accessibilityLabel="Loading listing"
    >
      {/* Image skeleton */}
      <View
        style={{
          height: 200,
          backgroundColor: colors.graphite700,
        }}
      />
      {/* Content skeleton */}
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <View
          style={{
            width: '40%',
            height: 12,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
        <View
          style={{
            width: '70%',
            height: 18,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
        <View
          style={{
            width: '50%',
            height: 12,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
        <View
          style={{
            width: '30%',
            height: 16,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
      </View>
    </View>
  );
}
