import React from 'react';
import { Text, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius, minTouchSize } from '../../theme/spacing';
import { AlpinePressable } from './AlpinePressable';

interface ActivityChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Icon + label chip for activity filtering.
 * Selected = lime fill; pressed = scale 0.992 + background emphasis + selection haptic.
 */
export function ActivityChip({
  icon,
  label,
  isSelected = false,
  onPress,
  disabled = false,
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
    backgroundColor: isSelected ? colors.signalLime : colors.surfaceElevated,
    borderWidth: 1,
    borderColor: isSelected ? colors.signalLime : colors.border,
    gap: spacing.xs,
  };

  return (
    <AlpinePressable
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      style={chipStyle}
      pressedStyle={{
        backgroundColor: isSelected ? colors.signalLimeDark : colors.surface,
      }}
      disabledStyle={{
        backgroundColor: colors.titanium100,
        borderColor: colors.titanium100,
      }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label}${isSelected ? ', selected' : ''}`}
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? colors.textTertiary : isSelected ? colors.carbon950 : colors.graphite500}
      />
      <Text
        style={[
          typography.labelSmall,
          { color: disabled ? colors.textTertiary : isSelected ? colors.carbon950 : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </AlpinePressable>
  );
}
