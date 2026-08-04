import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { AlpinePressable } from './AlpinePressable';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  padded?: boolean;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  padded = true,
  elevated = false,
  style,
  testID,
  accessibilityLabel,
}: CardProps) {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...(elevated && {
      shadowColor: colors.carbon950,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
    ...(padded && {
      padding: spacing.lg,
    }),
    ...style,
  };

  if (onPress) {
    return (
      <AlpinePressable
        onPress={onPress}
        style={cardStyle}
        pressedStyle={{ backgroundColor: colors.surface }}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </AlpinePressable>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
}
