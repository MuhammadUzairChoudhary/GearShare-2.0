import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label: string;
  /** Marks the field as required — renders a red asterisk next to the label. */
  required?: boolean;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  testID?: string;
}

export function TextInput({
  label,
  required = false,
  error,
  hint,
  containerStyle,
  testID,
  ...inputProps
}: TextInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);
  const borderColor = hasError ? colors.error : isFocused ? colors.borderFocused : colors.border;

  const container: ViewStyle = {
    gap: spacing.xs,
    ...containerStyle,
  };

  return (
    <View style={container} testID={testID}>
      <Text
        style={[typography.labelMedium, { color: hasError ? colors.error : colors.textSecondary }]}
      >
        {label}
        {required && (
          <Text style={{ color: colors.error, fontWeight: '700' }}>{' *'}</Text>
        )}
      </Text>
      <RNTextInput
        style={[
          {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor,
            borderRadius: radius.input,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            color: colors.textPrimary,
            ...typography.bodyLarge,
            minHeight: 48,
          },
          inputProps.multiline && {
            minHeight: 100,
            textAlignVertical: 'top',
          },
        ]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setIsFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          inputProps.onBlur?.(e);
        }}
        accessibilityLabel={label}
        accessibilityState={{ disabled: inputProps.editable === false }}
        {...inputProps}
      />{' '}
      {error ? (
        <Text style={[typography.bodySmall, { color: colors.error }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}
