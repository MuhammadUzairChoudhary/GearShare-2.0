import React, { useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { pressMotion } from '../../theme/motion';
import { AlpinePressable, type HapticFeedback } from './AlpinePressable';
import { haptics } from '../../services/feedback/haptics';

export type AppButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
export type AppButtonSize = 'small' | 'medium' | 'large';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

interface VariantPalette {
  bg: string;
  pressedBg: string;
  text: string;
  border?: string;
  pressedBorder?: string;
  spinner: string;
}

/**
 * Alpine button system.
 *
 * Variants:
 * - primary:     the single most important action on a screen (lime fill, dark text)
 * - secondary:   a meaningful alternative (neutral surface, 1px border, high-contrast label)
 * - tertiary:    quiet text action that must not compete with the primary
 * - destructive: irreversible actions (dark red surface, error red label)
 * - ghost:       lowest-emphasis text action (Clear All, Sign Out)
 *
 * States: resting, pressed (0.985 scale + background shift, 80 ms), disabled
 * (muted palette — never opacity alone), loading (size preserved, label kept for
 * screen readers, duplicate submissions blocked).
 */
export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  testID,
  accessibilityLabel,
}: AppButtonProps) {
  const { colors } = useTheme();
  const submitGuard = useRef(false);

  const sizeConfig: Record<AppButtonSize, { minHeight: number; paddingHorizontal: number; fontSize: number; lineHeight: number }> = {
    small: { minHeight: 40, paddingHorizontal: spacing.lg, fontSize: 12, lineHeight: 18 },
    medium: { minHeight: 52, paddingHorizontal: spacing.xl, fontSize: 14, lineHeight: 20 },
    large: { minHeight: 56, paddingHorizontal: spacing.xxl, fontSize: 16, lineHeight: 24 },
  };

  const palette: Record<AppButtonVariant, VariantPalette> = {
    primary: {
      bg: colors.signalLime,
      pressedBg: colors.signalLimeDark,
      text: colors.carbon950,
      spinner: colors.carbon950,
    },
    secondary: {
      bg: colors.surfaceElevated,
      pressedBg: colors.surface,
      text: colors.textPrimary,
      border: colors.graphite700,
      pressedBorder: colors.textPrimary,
      spinner: colors.textPrimary,
    },
    tertiary: {
      bg: 'transparent',
      pressedBg: colors.surface,
      text: colors.textPrimary,
      spinner: colors.textPrimary,
    },
    destructive: {
      bg: colors.errorBackground,
      pressedBg: colors.carbon950,
      text: colors.error,
      border: colors.error,
      pressedBorder: colors.error,
      spinner: colors.error,
    },
    ghost: {
      bg: 'transparent',
      pressedBg: colors.surface,
      text: colors.textSecondary,
      spinner: colors.textSecondary,
    },
  };

  const active = palette[variant];
  const config = sizeConfig[size];

  // Disabled palettes — explicit colors so controls stay readable, never opacity-only.
  const disabledPalette: VariantPalette = {
    bg: colors.titanium100,
    pressedBg: colors.titanium100,
    text: colors.graphite500,
    border: colors.titanium100,
    spinner: colors.graphite500,
  };
  const disabledBorderlessPalette: VariantPalette = {
    ...disabledPalette,
    bg: 'transparent',
    border: undefined,
  };
  const isBorderless = variant === 'primary' || variant === 'tertiary' || variant === 'ghost';
  const disabledColors = isBorderless ? disabledBorderlessPalette : disabledPalette;
  // Loading keeps the active palette — the button stays visibly engaged while
  // submitting; only `disabled` mutes it.
  const colorsToUse = disabled ? disabledColors : active;

  const isDestructiveOrPrimary = variant === 'primary' || variant === 'destructive';

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    // Duplicate-submission protection: ignore rapid re-presses before the
    // caller's loading state propagates.
    if (submitGuard.current) return;
    submitGuard.current = true;
    setTimeout(() => {
      submitGuard.current = false;
    }, 120);

    if (isDestructiveOrPrimary) {
      haptics.action();
    } else {
      haptics.selection();
    }
    onPress();
  }, [disabled, loading, isDestructiveOrPrimary, onPress]);

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    minHeight: config.minHeight,
    paddingHorizontal: config.paddingHorizontal,
    backgroundColor: colorsToUse.bg,
    borderWidth: colorsToUse.border ? 1 : 0,
    borderColor: colorsToUse.border,
    // Preserve the legacy stretch behaviour: buttons fill their column by
    // default; `fullWidth` is a no-op in that case but still works in rows.
    ...(fullWidth ? { width: '100%' } : {}),
  };

  const labelStyle: TextStyle = {
    ...typography.labelLarge,
    fontSize: config.fontSize,
    lineHeight: config.lineHeight,
    color: colorsToUse.text,
    textAlign: 'center',
  };

  return (
    <AlpinePressable
      onPress={handlePress}
      disabled={disabled || loading}
      haptic="none"
      pressedScale={pressMotion.buttonPressedScale}
      // Pressed feedback can only occur when handlers are attached (not
      // disabled/loading), so the active pressed palette is always safe here.
      pressedStyle={{
        backgroundColor: active.pressedBg,
        borderColor: active.pressedBorder ?? active.border,
      }}
      style={containerStyle}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      hitSlopSize="sm"
    >
      <ViewRow>
        {loading && <ActivityIndicator size="small" color={colorsToUse.spinner} />}
        <Text style={[labelStyle, loading && { opacity: 0 }]} numberOfLines={1}>
          {title}
        </Text>
      </ViewRow>
    </AlpinePressable>
  );
}

function ViewRow({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        flexShrink: 1,
      }}
    >
      {children}
    </View>
  );
}
