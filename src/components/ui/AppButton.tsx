import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius, minTouchSize } from '../../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  testID,
  accessibilityLabel,
}: AppButtonProps) {
  const { colors } = useTheme();

  const sizeStyles: Record<
    ButtonSize,
    { paddingVertical: number; paddingHorizontal: number; fontSize: number }
  > = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 12 },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: 14 },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, fontSize: 16 },
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.signalLime,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.graphite700,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.errorBackground,
      borderWidth: 1,
      borderColor: colors.error,
    },
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: colors.carbon950 ?? '#0B0D0E',
    secondary: colors.textPrimary ?? '#F8F9F9',
    ghost: colors.textSecondary ?? '#AEB4B7',
    danger: colors.error ?? '#FF6B65',
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    minHeight: minTouchSize,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled ? 0.5 : 1,
  };

  if (fullWidth) {
    containerStyle.width = '100%';
  }

  const labelStyle: TextStyle = {
    ...typography.labelLarge,
    color: textColors[variant],
    textAlign: 'center',
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.carbon950 : colors.textPrimary}
          size="small"
        />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
