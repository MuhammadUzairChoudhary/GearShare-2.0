import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius, minTouchSize } from '../../theme/spacing';
import { AlpinePressable } from './AlpinePressable';

export type ChipVariant = 'default' | 'active' | 'accent';

interface ChipProps {
  label: string;
  onPress?: () => void;
  variant?: ChipVariant;
  disabled?: boolean;
  testID?: string;
}

/**
 * Category / filter chip.
 *
 * States:
 * - default: neutral surface, graphite border
 * - active:  lime fill, dark label (selected filter)
 * - accent:  informational (verified owner, etc.)
 * - pressed: background emphasis + 0.992 scale, selection haptic
 * - disabled: muted palette (never opacity alone) and no press handler
 */
export function Chip({ label, onPress, variant = 'default', disabled = false, testID }: ChipProps) {
  const { colors } = useTheme();

  const variants: Record<ChipVariant, { bg: string; border: string; text: string; pressedBg: string }> = {
    default: {
      bg: colors.surfaceElevated,
      border: colors.graphite700,
      text: colors.textPrimary,
      pressedBg: colors.surface,
    },
    active: {
      bg: colors.signalLime,
      border: colors.signalLime,
      text: colors.carbon950,
      pressedBg: colors.signalLimeDark,
    },
    accent: {
      bg: colors.informationBackground,
      border: colors.iceBlue,
      text: colors.iceBlue,
      pressedBg: colors.carbon850,
    },
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
    backgroundColor: variants[variant].bg,
    borderColor: variants[variant].border,
  };

  const textStyle = {
    ...typography.labelMedium,
    color: disabled ? colors.textTertiary : variants[variant].text,
  };

  if (!onPress) {
    return (
      <View
        style={[
          chipStyle,
          // Disabled uses an explicit muted palette — never opacity alone.
          disabled && {
            backgroundColor: colors.titanium100,
            borderColor: colors.titanium100,
          },
        ]}
        testID={testID}
      >
        <Text style={textStyle}>{label}</Text>
      </View>
    );
  }

  return (
    <AlpinePressable
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      style={chipStyle}
      pressedStyle={{ backgroundColor: variants[variant].pressedBg, borderColor: variants[variant].border }}
      disabledStyle={{
        backgroundColor: colors.titanium100,
        borderColor: colors.titanium100,
      }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={textStyle}>{label}</Text>
    </AlpinePressable>
  );
}
