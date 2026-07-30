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
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,      // Figma: 12px
        gap: 16,
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      testID={testID}
      accessibilityLabel="Loading listing"
    >
      {/* Image skeleton (112×112) */}
      <View
        style={{
          width: 112,
          height: 112,
          borderRadius: radius.image,
          backgroundColor: colors.graphite700,
        }}
      />
      {/* Content skeleton */}
      <View
        style={{
          flex: 1,
          height: 112,
          justifyContent: 'space-between',
          paddingVertical: 0,
          gap: 4,
        }}
      >
        {/* Title */}
        <View
          style={{
            width: '80%',
            height: 14,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
        <View
          style={{
            width: '50%',
            height: 14,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
        {/* Rating */}
        <View
          style={{
            width: '40%',
            height: 12,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
        {/* Price */}
        <View
          style={{
            width: '35%',
            height: 18,
            borderRadius: radius.chip,
            backgroundColor: colors.graphite700,
          }}
        />
      </View>
    </View>
  );
}
