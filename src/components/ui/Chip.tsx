import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fontFamilies, typography, typeScale } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { spacing, radius, minTouchSize } from '../../theme/spacing';
import { AlpinePressable } from './AlpinePressable';

/** Matches the notification-bell red and the unread bubble on chat cards. */
const UNREAD_RED = '#EF4444';

export type ChipVariant = 'default' | 'active' | 'accent';

interface ChipProps {
  label: string;
  onPress?: () => void;
  variant?: ChipVariant;
  disabled?: boolean;
  /** Explore-style pill: fully rounded, 32px tall, mono uppercase label.
   *  Touch target stays ≥44px via hit slop. */
  pill?: boolean;
  /**
   * Actionable count shown as a small red bubble beside the label
   * (e.g. archived chats with new messages). Hidden when absent or 0.
   */
  badgeCount?: number;
  testID?: string;
}

/**
 * Category / filter chip.
 *
 * States:
 * - default: neutral surface, graphite border
 * - active:  theme-black fill, white label (selected filter)
 * - accent:  informational (verified owner, etc.)
 * - pressed: background emphasis + 0.992 scale, selection haptic
 * - disabled: muted palette (never opacity alone) and no press handler
 */
export function Chip({
  label,
  onPress,
  variant = 'default',
  disabled = false,
  pill = false,
  badgeCount,
  testID,
}: ChipProps) {
  const { colors } = useTheme();
  const showBadge = badgeCount !== undefined && badgeCount > 0;
  // The chip label announces the count; the badge itself stays hidden from
  // screen readers so it is never announced twice.
  const badgeLabel = showBadge ? `${badgeCount} with new messages` : '';

  const renderBadge = () =>
    showBadge ? (
      <View
        style={{
          minWidth: 18,
          height: 18,
          paddingHorizontal: 4,
          borderRadius: 9,
          marginLeft: 6,
          backgroundColor: UNREAD_RED,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        // Decorative for screen readers — the chip's own label already
        // announces the count, so avoid double announcement on Android.
        importantForAccessibility="no"
      >
        <Text
          style={{
            fontFamily: fontFamilies.inter.bold,
            fontSize: rf(9),
            lineHeight: rf(12),
            color: colors.white,
          }}
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </Text>
      </View>
    ) : null;

  const variants: Record<ChipVariant, { bg: string; border: string; text: string; pressedBg: string }> = {
    default: {
      bg: colors.surfaceElevated,
      border: colors.graphite700,
      text: colors.textPrimary,
      pressedBg: colors.surface,
    },
    active: {
      bg: colors.carbon950,
      border: colors.carbon950,
      text: colors.white,
      pressedBg: colors.carbon850,
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
    paddingHorizontal: pill ? 16 : spacing.md,
    paddingVertical: pill ? 0 : spacing.xs,
    borderRadius: pill ? 9999 : radius.chip,
    borderWidth: 1,
    // Pill matches the explore tab's filter chips exactly (fixed 32px height).
    height: pill ? 32 : undefined,
    minHeight: pill ? undefined : minTouchSize,
    backgroundColor: variants[variant].bg,
    borderColor: variants[variant].border,
  };

  const textStyle = {
    ...(pill ? typeScale.monoSmall : typography.labelMedium),
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
        {renderBadge()}
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
      hitSlopSize={pill ? 'md' : undefined}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={badgeLabel ? `${label}, ${badgeLabel}` : label}
      accessibilityState={{ disabled, selected: variant === 'active' }}
    >
      <Text style={textStyle}>{label}</Text>
      {renderBadge()}
    </AlpinePressable>
  );
}
