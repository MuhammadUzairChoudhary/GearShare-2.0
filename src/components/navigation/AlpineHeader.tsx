import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { spacing, radius } from '../../theme/spacing';

interface AlpineHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** One or two trailing actions rendered on the right (44×44 targets). */
  trailing?: React.ReactNode;
  /** Over-image state: neutral back surface, light title, no divider. */
  transparent?: boolean;
  /** Scrolled solid state: opaque background + one-pixel bottom divider. */
  scrolled?: boolean;
  testID?: string;
}

/**
 * Reusable Alpine header.
 *
 * Rules:
 * - Compact height; Space Grotesk title; 44×44 back target.
 * - One-pixel divider when content scrolls under the header (scrolled).
 * - Transparent variant for headers over photography (back on a readable surface).
 * - Never renders alongside a system header (screens set headerShown: false).
 */
export function AlpineHeader({
  title,
  subtitle,
  onBack,
  trailing,
  transparent = false,
  scrolled = false,
  testID,
}: AlpineHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const solid = !transparent || scrolled;

  return (
    <View
      testID={testID}
      style={{
        paddingTop: insets.top,
        backgroundColor: solid ? colors.white : 'transparent',
        borderBottomWidth: solid && scrolled ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 56,
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        }}
      >
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.button,
              backgroundColor: transparent ? 'rgba(248,249,249,0.9)' : 'transparent',
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={transparent ? colors.carbon950 : colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fontFamilies.spaceGrotesk.bold,
              fontSize: rf(16),
              lineHeight: rf(22),
              letterSpacing: -0.3,
              color: transparent ? colors.carbon950 : colors.textPrimary,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fontFamilies.inter.regular,
                fontSize: rf(10),
                lineHeight: rf(14),
                color: transparent ? colors.graphite500 : colors.textSecondary,
                marginTop: 1,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {trailing ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            {trailing}
          </View>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
    </View>
  );
}
