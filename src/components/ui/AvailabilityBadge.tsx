import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { AppText } from './AppText';
import type { AvailabilityStatus } from '../../types/listing';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  testID?: string;
}

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; bg: string; dot: string }> = {
  available: { label: 'Available', bg: '#14291B', dot: '#73D98B' },
  unavailable: { label: 'Unavailable', bg: '#321817', dot: '#FF6B65' },
  booked: { label: 'Booked', bg: '#2F2914', dot: '#F2C94C' },
};

export function AvailabilityBadge({ status, testID }: AvailabilityBadgeProps) {
  const config = STATUS_CONFIG[status];

  const badgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    backgroundColor: config.bg,
    gap: spacing.xs,
  };

  return (
    <View style={badgeStyle} testID={testID} accessibilityLabel={config.label}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.dot,
        }}
      />
      <AppText variant="labelMedium" style={{ color: config.dot }}>
        {config.label}
      </AppText>
    </View>
  );
}
