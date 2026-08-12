import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { BackButton } from '../ui/BackButton';
import { Avatar } from '../ui/Avatar';
import { AlpinePressable } from '../ui/AlpinePressable';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { spacing } from '../../theme/spacing';

interface AlpineHeaderProps {
  title: string;
  subtitle?: string;
  /** Small leading avatar (e.g. the other party in a chat header). */
  avatar?: { uri: string | null; name: string } | null;
  /** Tapping the title (and avatar, when present) — e.g. open the other party's profile. */
  onTitlePress?: () => void;
  onBack?: () => void;
  /** One or two trailing actions rendered on the right (44×44 targets). */
  trailing?: React.ReactNode;
  /** Over-image state: neutral back surface, light title, no divider. */
  transparent?: boolean;
  /**
   * Flat non-white surface state (e.g. the grey chat field): the header has no
   * fill of its own and the back button is bare (no stroke, no fill).
   */
  bareBack?: boolean;
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
  avatar,
  onTitlePress,
  onBack,
  trailing,
  transparent = false,
  bareBack = false,
  scrolled = false,
  testID,
}: AlpineHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // On flat non-white surfaces the header takes no fill of its own, so the
  // surface (e.g. the grey chat field) shows through behind title + back.
  const solid = (!transparent && !bareBack) || scrolled;

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
          <BackButton onPress={onBack} bare={bareBack} />
        ) : (
          <View style={{ width: 44 }} />
        )}

        {/* Title block — pressable when onTitlePress is provided (e.g. opens the profile) */}
        <AlpinePressable
          onPress={onTitlePress}
          disabled={!onTitlePress}
          style={{ flex: 1 }}
          pressedStyle={{ opacity: 0.6 }}
          accessibilityRole={onTitlePress ? 'button' : 'text'}
          accessibilityLabel={
            onTitlePress ? `${title}${subtitle ? `, ${subtitle}` : ''}. View profile` : undefined
          }
        >
          {/*
            Row layout lives on an inner View — AlpinePressable wraps children in
            a column Animated.View (for the scale), so flexDirection on the
            pressable style alone would stack the avatar above the text.
          */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {avatar ? <Avatar uri={avatar.uri} name={avatar.name} size="md" /> : null}

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fontFamilies.spaceGrotesk.bold,
                  fontSize: rf(14),
                  lineHeight: rf(20),
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
                    fontSize: rf(9),
                    lineHeight: rf(13),
                    color: transparent ? colors.graphite500 : colors.textSecondary,
                    marginTop: 1,
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        </AlpinePressable>

        {trailing ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {trailing}
          </View>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
    </View>
  );
}
