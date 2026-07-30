import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppIcon, type IconName } from './Icons';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';

const TAB_CONFIG: { key: string; label: string; icon: IconName }[] = [
  { key: 'discover', label: 'Explore', icon: 'discover' },
  { key: 'rentals', label: 'My Rentals', icon: 'rentals' },
  { key: 'inbox', label: 'Chat', icon: 'inbox' },
  { key: 'account', label: 'Profile', icon: 'account' },
];

export function CustomTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        height: 80 + (insets?.bottom ?? 0),
        paddingBottom: insets?.bottom ?? 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#DDE1E3',
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
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconColor = isFocused ? '#1F2225' : 'rgba(31,34,37,0.4)';
        const labelColor = isFocused ? '#1F2225' : 'rgba(31,34,37,0.4)';

        // Account icon is 25×20, others are 20×20
        const iconSize = config.icon === 'account' ? 25 : 20;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptor?.options?.tabBarAccessibilityLabel ?? config.label}
            activeOpacity={0.7}
            style={{
              alignItems: 'center',
              gap: 4,
              opacity: isFocused ? 1 : 0.4,
            }}
          >
            <View style={{ width: iconSize, height: 20, justifyContent: 'center', alignItems: 'center' }}>
              <AppIcon name={config.icon} size={iconSize} color={iconColor} />
            </View>
            <Text
              style={{
                fontFamily: fontFamilies.inter.bold,
                fontSize: rf(8),
                lineHeight: rf(15),
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: labelColor,
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
