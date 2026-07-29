import React from 'react';
import { TouchableOpacity, Text, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius, minTouchSize } from '../../theme/spacing';

interface ActivityChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  testID?: string;
}

export function ActivityChip({
  icon,
  label,
  isSelected = false,
  onPress,
  testID,
}: ActivityChipProps) {
  const { colors } = useTheme();

  const chipStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: minTouchSize,
    minHeight: minTouchSize + 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    backgroundColor: isSelected ? colors.signalLime : colors.surface,
    borderWidth: 1,
    borderColor: isSelected ? colors.signalLime : colors.border,
    gap: spacing.xs,
  };

  const isActive = isSelected;

  return (
    <TouchableOpacity
      style={chipStyle}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${isSelected ? 'selected' : ''}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Ionicons name={icon} size={22} color={isActive ? colors.carbon950 : colors.graphite500} />
      <Text
        style={[
          typography.labelSmall,
          { color: isActive ? colors.carbon950 : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
