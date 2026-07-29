import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';

interface DividerProps {
  color?: string;
  thickness?: number;
  marginVertical?: number;
  testID?: string;
}

export function Divider({
  color: customColor,
  thickness = 1,
  marginVertical = spacing.lg,
  testID,
}: DividerProps) {
  const { colors } = useTheme();

  const dividerStyle: ViewStyle = {
    height: thickness,
    backgroundColor: customColor ?? colors.border,
    marginVertical,
  };

  return <View style={dividerStyle} testID={testID} />;
}
