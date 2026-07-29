import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography, type TypographyToken } from '../../theme/typography';

export interface AppTextProps extends TextProps {
  variant?: TypographyToken;
  color?: keyof ReturnType<typeof useTheme>['colors'];
  align?: TextStyle['textAlign'];
  mono?: boolean;
  children: React.ReactNode;
}

export function AppText({
  variant = 'bodyMedium',
  color,
  align,
  mono,
  style,
  children,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();

  const textStyle: TextStyle = {
    ...typography[variant],
    color: color ? colors[color] : colors.textPrimary,
    textAlign: align,
  };

  if (mono) {
    textStyle.fontVariant = ['tabular-nums'];
  }

  return (
    <Text
      style={[textStyle, style]}
      accessibilityRole={props.accessibilityRole ?? 'text'}
      {...props}
    >
      {children}
    </Text>
  );
}
