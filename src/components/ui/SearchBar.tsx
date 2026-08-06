import React from 'react';
import { View, TextInput, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  /** Screen-reader label; defaults to the gear-listings label. */
  accessibilityLabel?: string;
  testID?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search gear, brands, categories…',
  accessibilityLabel = 'Search gear listings',
  testID,
}: SearchBarProps) {
  const { colors } = useTheme();

  // Same visual language as the dashboard/search bars: white surface,
  // hairline border, radius 10, 40px height.
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 40,
    gap: spacing.md,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Ionicons name="search-outline" size={14} color={colors.graphite500} />
      <TextInput
        style={[
          {
            flex: 1,
            fontFamily: typography.bodyLarge.fontFamily,
            fontSize: typography.bodyLarge.fontSize,
            lineHeight: typography.bodyLarge.lineHeight,
            color: colors.textPrimary,
            padding: 0,
            margin: 0,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={colors.graphite500} />
        </TouchableOpacity>
      )}
    </View>
  );
}
