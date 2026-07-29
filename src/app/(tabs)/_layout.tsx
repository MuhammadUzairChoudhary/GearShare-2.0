import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TAB_ICONS } from '../../constants/routes';

function IonIcon({
  name,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface ?? '#171A1C',
          borderTopColor: colors.border ?? '#353A3D',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#C8FF3D',
        tabBarInactiveTintColor: '#6F767A',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="discover/index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused, color, size }) => (
            <IonIcon
              name={focused ? TAB_ICONS.discoverFocused : TAB_ICONS.discover}
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rentals/index"
        options={{
          title: 'Rentals',
          tabBarIcon: ({ focused, color, size }) => (
            <IonIcon
              name={focused ? TAB_ICONS.rentalsFocused : TAB_ICONS.rentals}
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox/index"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ focused, color, size }) => (
            <IonIcon
              name={focused ? TAB_ICONS.inboxFocused : TAB_ICONS.inbox}
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account/index"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused, color, size }) => (
            <IonIcon
              name={focused ? TAB_ICONS.accountFocused : TAB_ICONS.account}
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
