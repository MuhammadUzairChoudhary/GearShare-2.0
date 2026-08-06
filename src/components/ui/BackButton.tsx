import React from 'react';
import { router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/spacing';
import { AlpinePressable } from './AlpinePressable';
import { AppIcon } from './Icons';
import {
  headerActionContainer,
  headerActionPressed,
  resolveHeaderActionMode,
} from './headerActionStyles';

interface BackButtonProps {
  /** Defaults to router.back(). Override for custom behaviour (e.g. exit a selection mode). */
  onPress?: () => void;
  /**
   * Renders over photography/other busy content (e.g. the listing hero):
   * a translucent surface so the image shows through, matching the adjacent
   * share/save actions.
   */
  overContent?: boolean;
  /**
   * Bare mode for flat non-white surfaces (e.g. the grey chat field):
   * no stroke and no fill of its own — just the chevron on the surface.
   * Plain (solid surface + hairline) everywhere else.
   */
  bare?: boolean;
  testID?: string;
}

/**
 * The standard back button — the neutral 40×40 surface first used in the
 * gear-details header. Three scenarios:
 * - Theme background: white fill, 1px hairline border, radius 10, `back` chevron.
 * - Flat non-white surface (bare): no stroke, no fill — the chevron alone.
 * - Over an image (overContent): translucent fill + hairline, like the hero actions.
 * The visual is 40px, but hit slop keeps the touch target ≥44px.
 */
export function BackButton({ onPress, overContent = false, bare = false, testID }: BackButtonProps) {
  const { colors, isDark } = useTheme();
  const mode = resolveHeaderActionMode(bare, overContent);

  return (
    <AlpinePressable
      onPress={onPress ?? (() => router.back())}
      hitSlopSize="sm"
      style={{
        width: 40,
        height: 40,
        borderRadius: radius.card,
        ...headerActionContainer(mode, colors, isDark),
        alignItems: 'center',
        justifyContent: 'center',
      }}
      pressedStyle={headerActionPressed(mode, colors, isDark)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <AppIcon name="back" size={14} color={colors.textPrimary} />
    </AlpinePressable>
  );
}
