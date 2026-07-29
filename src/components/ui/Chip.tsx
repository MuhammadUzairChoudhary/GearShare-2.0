import React from 'react';
import { TouchableOpacity, Text, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius, minTouchSize } from '../../theme/spacing';

export type ChipVariant = 'default' | 'active' | 'accent';

interface ChipProps {
  label: string;
  onPress?: () => void;
  variant?: ChipVariant;
  disabled?: boolean;
  testID?: string;
}

export function Chip({ label, onPress, variant = 'default', disabled = false, testID }: ChipProps) {
  const { colors } = useTheme();

  const variants: Record<ChipVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.surface ?? colors.carbon850,
      borderColor: colors.border ?? colors.graphite700,
    },
    active: {
      backgroundColor: colors.signalLime ?? '#C8FF3D',
      borderColor: colors.signalLime ?? '#C8FF3D',
    },
    accent: {
      backgroundColor: colors.informationBackground ?? '#13262D',
      borderColor: colors.iceBlue ?? '#69C8E8',
    },
  };

  const textVariants: Record<ChipVariant, string> = {
    default: colors.textSecondary ?? '#AEB4B7',
    active: colors.carbon950 ?? '#0B0D0E',
    accent: colors.iceBlue ?? '#69C8E8',
  };

  const chipStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    borderWidth: 1,
    minHeight: minTouchSize,
    opacity: disabled ? 0.5 : 1,
    ...variants[variant],
  };

  return (
    <TouchableOpacity
      style={chipStyle}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
    >
      <Text style={[typography.labelMedium, { color: textVariants[variant] }]}>{label}</Text>
    </TouchableOpacity>
  );
}
