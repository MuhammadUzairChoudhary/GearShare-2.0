import React from 'react';
import { View, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from '../ui/AppText';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  testID?: string;
}

export function LoadingState({ message, size = 'large', testID }: LoadingStateProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxxl,
    gap: spacing.md,
  };

  return (
    <View
      style={containerStyle}
      testID={testID}
      accessibilityLabel={message ?? 'Loading'}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size={size} color={colors.signalLime} />
      {message && (
        <AppText variant="bodyMedium" color="textSecondary" align="center">
          {message}
        </AppText>
      )}
    </View>
  );
}
