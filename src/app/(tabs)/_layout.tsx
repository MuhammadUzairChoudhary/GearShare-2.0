import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/ui/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="discover/index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="rentals/index" options={{ title: 'My Rentals' }} />
      <Tabs.Screen name="inbox/index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="account/index" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
