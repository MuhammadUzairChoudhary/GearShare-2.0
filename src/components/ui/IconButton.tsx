import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { minTouchSize, radius, spacing } from '../../theme/spacing';
import { AlpinePressable, type HapticFeedback } from './AlpinePressable';
import { AppIcon, type IconName } from './Icons';
import {
  headerActionContainer,
  headerActionPressed,
  resolveHeaderActionMode,
} from './headerActionStyles';
import type { ViewStyle } from 'react-native';

interface IconButtonProps {
  /** Ionicons glyph — used unless `appIcon` is provided. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom Alpine icon (heavier, design-system glyph) — overrides `icon`. */
  appIcon?: IconName;
  onPress: () => void;
  /** Icon size in px (default 24). */
  size?: number;
  color?: string;
  disabled?: boolean;
  haptic?: HapticFeedback;
  /**
   * Header-action mode, matching BackButton:
   * - default: transparent (generic IconButton)
   * - bare: no stroke, no fill — flat non-white surfaces (grey chat field)
   * - overContent: translucent + hairline — over photography
   */
  bare?: boolean;
  overContent?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel: string;
}

/**
 * Icon-only touch target. Minimum 44×44 px, visible pressed state
 * (subtle neutral surface), selection haptic, expanded hit slop.
 *
 * Header variants (bare / overContent) share the BackButton's three-mode
 * system via `headerActionStyles`.
 */
export function IconButton({
  icon,
  appIcon,
  onPress,
  size = 24,
  color,
  disabled = false,
  haptic = 'selection',
  bare = false,
  overContent = false,
  style,
  testID,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors, isDark } = useTheme();
  const mode = bare || overContent ? resolveHeaderActionMode(bare, overContent) : null;

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: minTouchSize,
    minHeight: minTouchSize,
    borderRadius: radius.button,
    padding: spacing.xs,
    ...(mode ? headerActionContainer(mode, colors, isDark) : null),
    ...style,
  };

  return (
    <AlpinePressable
      onPress={onPress}
      disabled={disabled}
      haptic={haptic}
      style={containerStyle}
      pressedStyle={mode ? headerActionPressed(mode, colors, isDark) : { backgroundColor: colors.surface }}
      // Explicit muted surface (never opacity alone) — the icon itself also
      // switches to textTertiary when disabled.
      disabledStyle={{ backgroundColor: colors.titanium100 }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {appIcon ? (
        <AppIcon
          name={appIcon}
          size={size}
          color={disabled ? colors.textTertiary : (color ?? colors.textPrimary)}
        />
      ) : (
        <Ionicons name={icon} size={size} color={disabled ? colors.textTertiary : (color ?? colors.textPrimary)} />
      )}
    </AlpinePressable>
  );
}
