import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({
  icon = 'search-outline',
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxxl,
    gap: spacing.md,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Ionicons name={icon} size={48} color={colors.graphite500} />
      <AppText variant="titleMedium" color="textPrimary" align="center">
        {title}
      </AppText>
      {description && (
        <AppText variant="bodyMedium" color="textSecondary" align="center">
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <AppButton title={actionLabel} onPress={onAction} variant="secondary" size="md" />
      )}
    </View>
  );
}
