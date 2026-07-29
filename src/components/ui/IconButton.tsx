import React from 'react';
import { TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { minTouchSize } from '../../theme/spacing';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel: string;
}

export function IconButton({
  icon,
  onPress,
  size = 24,
  color,
  disabled = false,
  testID,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: minTouchSize,
    minHeight: minTouchSize,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.textPrimary} />
    </TouchableOpacity>
  );
}
