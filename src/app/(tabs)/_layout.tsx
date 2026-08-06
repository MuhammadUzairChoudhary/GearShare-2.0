import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/ui/CustomTabBar';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { useConversations } from '../../hooks/useMessages';

export default function TabLayout() {
  const { isAuthenticated, user } = useAuthContext();
  // Live unread-message badge for the Chat tab — actionable information only.
  const { data: conversations } = useConversations(
    isAuthenticated ? (user?.id ?? '') : '',
  );
  const unreadMessages = useMemo(
    // Archived conversations are hidden from All — they don't count toward the badge.
    () =>
      (conversations ?? [])
        .filter((c) => !c.archived)
        .reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} badgeCounts={{ inbox: unreadMessages }} />}
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
