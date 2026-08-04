import React, { useMemo } from 'react';
import { View, FlatList, RefreshControl, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { ConversationCard } from '../../../components/ui/ConversationCard';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useConversations } from '../../../hooks/useMessages';
import { spacing } from '../../../theme/spacing';
import { typeScale } from '../../../theme/typography';
import { useTheme } from '../../../theme/ThemeContext';
import { ROUTES } from '../../../constants/routes';
import type { Conversation } from '../../../types/message';

export default function InboxScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const {
    data: conversations,
    isLoading: conversationsLoading,
    isError,
    refetch,
    isFetching,
  } = useConversations(isAuthenticated ? (user?.id ?? '') : '');

  const totalUnread = useMemo(
    () => (conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  if (authLoading) {
    return (
      <Screen>
        <LoadingState message="Loading messages..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Chat</AppText>
          <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: spacing.sm }}>
            Sign in to message equipment owners and renters.
          </AppText>
          <View style={{ marginTop: spacing.xxl }}>
            <AppButton
              title="Sign In"
              onPress={() => router.push(ROUTES.AUTH.SIGN_IN)}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </Screen>
    );
  }

  if (conversationsLoading) {
    return (
      <Screen>
        <LoadingState message="Loading messages..." />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => refetch()} />
      </Screen>
    );
  }

  const handleConversationPress = (rentalId: string) => {
    router.push(ROUTES.CHAT(rentalId));
  };

  return (
    <Screen>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={{ paddingTop: spacing.xxl, gap: spacing.xs }}>
        <Text style={[typeScale.h1, { color: colors.textPrimary }]}>Chat</Text>
        <Text style={[typeScale.monoSmall, { color: colors.textSecondary }]}>
          {totalUnread > 0
            ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}`
            : `${conversations?.length ?? 0} conversation${(conversations?.length ?? 0) !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* ── Conversation list / empty state ───────────────────────── */}
      {!conversations || conversations.length === 0 ? (
        <EmptyState
          icon="chatbubble-outline"
          title="No conversations yet"
          description="When you request a rental or an owner responds, your messages will appear here."
          actionLabel="Discover Gear"
          onAction={() => router.push(ROUTES.TABS.DISCOVER)}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item: Conversation) => item.rentalId}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing.md }}>
              <ConversationCard
                conversation={item}
                onPress={() => handleConversationPress(item.rentalId)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xxxxl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={colors.graphite500}
              colors={[colors.signalLime]}
            />
          }
        />
      )}
    </Screen>
  );
}
