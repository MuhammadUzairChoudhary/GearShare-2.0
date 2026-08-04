import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppIcon, type IconName } from './Icons';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { useTheme } from '../../theme/ThemeContext';
import { haptics } from '../../services/feedback/haptics';

export type TabKey = 'discover' | 'rentals' | 'inbox' | 'account';

const TAB_CONFIG: { key: TabKey; label: string; icon: IconName; badgeNoun: string }[] = [
  { key: 'discover', label: 'Explore', icon: 'discover', badgeNoun: 'updates' },
  { key: 'rentals', label: 'My Rentals', icon: 'rentals', badgeNoun: 'rentals need attention' },
  { key: 'inbox', label: 'Chat', icon: 'inbox', badgeNoun: 'unread messages' },
  { key: 'account', label: 'Profile', icon: 'account', badgeNoun: 'notifications' },
];

interface CustomTabBarProps extends BottomTabBarProps {
  /**
   * Actionable badge counts per tab. Hidden when zero/absent.
   * Wire from real data (unread messages, rentals needing action) — never from promotion.
   */
  badgeCounts?: Partial<Record<TabKey, number>>;
}

export function CustomTabBar({ state, descriptors, navigation, insets, badgeCounts }: CustomTabBarProps) {
  const { colors } = useTheme();

  const formatBadge = (count: number) => (count > 9 ? '9+' : String(count));

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        height: 80 + (insets?.bottom ?? 0),
        paddingBottom: insets?.bottom ?? 0,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const descriptor = descriptors[route.key];

        const config = TAB_CONFIG.find((c) => route.name.startsWith(c.key));
        if (!config) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
            haptics.selection();
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const badgeCount = badgeCounts?.[config.key] ?? 0;
        const showBadge = badgeCount > 0;

        const iconColor = isFocused ? colors.textPrimary : colors.graphite500;
        const labelColor = isFocused ? colors.textPrimary : colors.graphite500;

        // Account icon is 25×20, others are 20×20
        const iconSize = config.icon === 'account' ? 25 : 20;

        const badgeLabel = showBadge
          ? `, ${formatBadge(badgeCount)} ${config.badgeNoun}`
          : '';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={`${descriptor?.options?.tabBarAccessibilityLabel ?? config.label}${badgeLabel}`}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              height: '100%',
            }}
          >
            {/* Active top rail — the single focused signal, no glow, no bounce */}
            {isFocused && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 28,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: colors.signalLime,
                }}
              />
            )}
            <View style={{ width: iconSize, height: 20, justifyContent: 'center', alignItems: 'center' }}>
              <AppIcon name={config.icon} size={iconSize} color={iconColor} />
              {showBadge && (
                <View
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    backgroundColor: colors.error,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.bold,
                      fontSize: rf(8),
                      lineHeight: rf(12),
                      color: colors.white,
                    }}
                  >
                    {formatBadge(badgeCount)}
                  </Text>
                </View>
              )}
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                fontFamily: fontFamilies.inter.bold,
                fontSize: rf(8),
                lineHeight: rf(15),
                // Tighter tracking so multi-word labels like "My Rentals"
                // stay on one line within the fixed-width tab slot.
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: labelColor,
                textAlign: 'center',
                width: '100%',
              }}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
