import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { spacing } from '../../../theme/spacing';
import { ROUTES } from '../../../constants/routes';

export default function InboxScreen() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Inbox</AppText>
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Inbox</AppText>
        </View>
        <EmptyState
          icon="chatbubble-outline"
          title="Sign in to message"
          description="Sign in to chat with equipment owners and renters."
          actionLabel="Sign In"
          onAction={() => router.push(ROUTES.AUTH.SIGN_IN)}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingTop: spacing.xxxl }}>
        <AppText variant="displayMedium">Inbox</AppText>
      </View>
      <EmptyState
        icon="chatbubble-outline"
        title="No messages yet"
        description="When you request a rental or an owner responds, your messages will appear here."
        actionLabel="Discover Gear"
        onAction={() => router.push(ROUTES.TABS.DISCOVER)}
      />
    </Screen>
  );
}
