import React from 'react';
import { View, TextInput, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { AppText } from './AppText';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  testID?: string;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  testID,
}: DateRangeSelectorProps) {
  const { colors } = useTheme();

  const inputStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    color: colors.textPrimary,
    ...typography.monoSmall,
  };

  return (
    <View style={{ gap: spacing.sm }} testID={testID}>
      <AppText variant="labelMedium" color="textSecondary">
        Rental Dates
      </AppText>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="bodySmall" color="textTertiary">
            Pickup
          </AppText>
          <TextInput
            style={inputStyle}
            value={startDate}
            onChangeText={onStartDateChange}
            placeholder="Aug 15"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="Rental start date"
          />
        </View>
        <Ionicons name="arrow-forward" size={16} color={colors.graphite500} />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="bodySmall" color="textTertiary">
            Return
          </AppText>
          <TextInput
            style={inputStyle}
            value={endDate}
            onChangeText={onEndDateChange}
            placeholder="Aug 18"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="Rental end date"
          />
        </View>
      </View>
    </View>
  );
}
