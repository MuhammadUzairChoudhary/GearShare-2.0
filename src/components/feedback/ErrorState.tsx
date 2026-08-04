import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  testID?: string;
}

export function ErrorState({
  title = "We couldn't load this content",
  message = 'Your data is safe. Check your connection and try again.',
  onRetry,
  testID,
}: ErrorStateProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxxl,
    gap: spacing.md,
  };

  return (
    <View style={containerStyle} testID={testID} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <AppText variant="titleMedium" color="error" align="center">
        {title}
      </AppText>
      <AppText variant="bodyMedium" color="textSecondary" align="center">
        {message}
      </AppText>
      {onRetry && <AppButton title="Try Again" onPress={onRetry} variant="secondary" size="medium" />}
    </View>
  );
}
