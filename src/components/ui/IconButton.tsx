import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { minTouchSize, radius, spacing } from '../../theme/spacing';
import { AlpinePressable, type HapticFeedback } from './AlpinePressable';
import type { ViewStyle } from 'react-native';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Icon size in px (default 24). */
  size?: number;
  color?: string;
  disabled?: boolean;
  haptic?: HapticFeedback;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel: string;
}

/**
 * Icon-only touch target. Minimum 44×44 px, visible pressed state
 * (subtle neutral surface), selection haptic, expanded hit slop.
 */
export function IconButton({
  icon,
  onPress,
  size = 24,
  color,
  disabled = false,
  haptic = 'selection',
  style,
  testID,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: minTouchSize,
    minHeight: minTouchSize,
    borderRadius: radius.button,
    padding: spacing.xs,
    ...style,
  };

  return (
    <AlpinePressable
      onPress={onPress}
      disabled={disabled}
      haptic={haptic}
      style={containerStyle}
      pressedStyle={{ backgroundColor: colors.surface }}
      // Explicit muted surface (never opacity alone) — the icon itself also
      // switches to textTertiary when disabled.
      disabledStyle={{ backgroundColor: colors.titanium100 }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={size} color={disabled ? colors.textTertiary : (color ?? colors.textPrimary)} />
    </AlpinePressable>
  );
}
