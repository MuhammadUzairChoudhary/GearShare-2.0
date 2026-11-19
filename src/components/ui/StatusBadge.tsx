import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import type { RentalStatusVariant } from '../../types/rental';

type BadgeVariant = RentalStatusVariant | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  testID?: string;
}

const STATUS_COLORS: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#2F2914', text: '#F2C94C', dot: '#F2C94C' },
  info: { bg: '#13262D', text: '#69C8E8', dot: '#69C8E8' },
  warning: { bg: '#2F2914', text: '#F2C94C', dot: '#F2C94C' },
  success: { bg: '#14291B', text: '#73D98B', dot: '#73D98B' },
  error: { bg: '#321817', text: '#FF6B65', dot: '#FF6B65' },
  neutral: { bg: '#353A3D', text: '#AEB4B7', dot: '#AEB4B7' },
};

export function StatusBadge({ label, variant = 'neutral', testID }: StatusBadgeProps) {
  const colors_ = STATUS_COLORS[variant];

  const badgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    backgroundColor: colors_.bg,
    gap: spacing.xs,
  };

  return (
    <View style={badgeStyle} testID={testID} accessibilityLabel={label}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors_.dot,
        }}
      />
      <Text style={[typography.labelMedium, { color: colors_.text }]}>{label}</Text>
    </View>
  );
}
