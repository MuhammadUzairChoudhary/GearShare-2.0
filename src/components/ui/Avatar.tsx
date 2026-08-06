import React from 'react';
import { View, Image, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  /** Named preset or an exact pixel size (e.g. 48). */
  size?: AvatarSize | number;
  testID?: string;
  accessibilityLabel?: string;
}

const AVATAR_DIMENSIONS: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function Avatar({ uri, name, size = 'md', testID, accessibilityLabel }: AvatarProps) {
  const { colors } = useTheme();
  const dimension = typeof size === 'number' ? size : AVATAR_DIMENSIONS[size];
  const borderRadius = dimension / 2;

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: dimension,
          height: dimension,
          borderRadius,
          backgroundColor: colors.surface,
        }}
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? name ?? 'Avatar'}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius,
        backgroundColor: colors.graphite700,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? name ?? 'Avatar'}
      accessibilityRole="image"
    >
      <Text
        style={[
          {
            color: colors.titanium50,
            fontSize: dimension * 0.35,
            fontWeight: '600',
          },
          typography.labelMedium,
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}
