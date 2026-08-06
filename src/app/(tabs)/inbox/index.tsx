import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { NotificationButton } from '../../../components/ui/NotificationButton';
import { IconButton } from '../../../components/ui/IconButton';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { ConversationCard } from '../../../components/ui/ConversationCard';
import { BackButton } from '../../../components/ui/BackButton';
import { AlpineDialog } from '../../../components/ui/AlpineDialog';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Chip } from '../../../components/ui/Chip';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import {
  useConversations,
  useConversationActions,
  type ConversationAction,
} from '../../../hooks/useMessages';
import { useToast } from '../../../providers/ToastProvider';
import { haptics } from '../../../services/feedback/haptics';
import { spacing } from '../../../theme/spacing';
import { typeScale } from '../../../theme/typography';
import { useTheme } from '../../../theme/ThemeContext';
import { ROUTES } from '../../../constants/routes';
import {
  filterConversations,
  filterConversationsByTab,
  countArchivedWithUnread,
  type ConversationTab,
} from '../../../utils/conversations';
import { getAnalyticsService } from '../../../services/analytics';
import type { Conversation } from '../../../types/message';

const FILTER_TABS: { key: ConversationTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'updates', label: 'Unread' },
  { key: 'archived', label: 'Archived' },
];

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
  const { mutate: runConversationAction, isPending: actionPending } = useConversationActions();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ConversationTab>('all');
  // RentalIds checked in selection mode (entered by long-pressing a card).
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Delete confirmation — destructive and permanent, so it asks first.
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isSelectionMode = selectedIds.length > 0;

  useEffect(() => {
    getAnalyticsService().trackEvent({ name: 'inbox_tab_changed', params: { tab: activeTab } });
  }, [activeTab]);

  // Tab first, then the search query narrows within the active tab.
  const tabConversations = useMemo(
    () => filterConversationsByTab(conversations ?? [], activeTab),
    [conversations, activeTab],
  );
  const filteredConversations = useMemo(
    () => filterConversations(tabConversations, query),
    [tabConversations, query],
  );

  // Archived chats with new messages — drives the badge on the Archived chip.
  // Counts conversations (chats), not total messages.
  const archivedWithUnread = useMemo(
    () => countArchivedWithUnread(conversations ?? []),
    [conversations],
  );

  // Selected conversation state — the header actions adapt to it:
  // all archived → offer Unarchive; all unread → offer Mark as read.
  const selectedConversations = useMemo(
    () => (conversations ?? []).filter((c) => selectedIds.includes(c.rentalId)),
    [conversations, selectedIds],
  );
  const allSelectedArchived =
    selectedIds.length > 0 && selectedConversations.every((c) => c.archived);
  // Default bulk action is Mark read (idempotent for already-read chats);
  // it only flips to Mark unread when every selected chat is already read.
  // Mirrors the archive flip: Archive unless all selected are archived.
  const allSelectedRead =
    selectedIds.length > 0 && selectedConversations.every((c) => c.unreadCount === 0);

  // ── Selection mode ─────────────────────────────────────────────────
  const toggleSelection = useCallback((rentalId: string) => {
    haptics.selection();
    setSelectedIds((prev) =>
      prev.includes(rentalId) ? prev.filter((id) => id !== rentalId) : [...prev, rentalId],
    );
  }, []);

  const exitSelection = useCallback(() => setSelectedIds([]), []);

  const handleCardPress = useCallback(
    (rentalId: string) => {
      if (isSelectionMode) {
        toggleSelection(rentalId);
        return;
      }
      router.push(ROUTES.CHAT(rentalId));
    },
    [isSelectionMode, toggleSelection],
  );

  const handleCardLongPress = useCallback((rentalId: string) => {
    haptics.selection();
    setSelectedIds((prev) => (prev.includes(rentalId) ? prev : [...prev, rentalId]));
  }, []);

  const runAction = useCallback(
    (action: ConversationAction) => {
      if (selectedIds.length === 0 || !user?.id || actionPending) return;
      runConversationAction(
        { action, rentalIds: selectedIds, userId: user.id },
        {
          onSuccess: () => {
            const count = selectedIds.length;
            const label = count === 1 ? 'Conversation' : `${count} conversations`;
            setSelectedIds([]);
            if (action === 'archive') showToast(`${label} archived`, 'success');
            else if (action === 'unarchive') showToast(`${label} restored`, 'success');
            else if (action === 'delete') showToast(`${label} deleted`, 'success');
            else if (action === 'read') showToast('Marked as read', 'success');
            else showToast('Marked as unread', 'success');
          },
        },
      );
    },
    [selectedIds, user?.id, actionPending, runConversationAction, showToast],
  );

  const handleDeletePress = useCallback(() => {
    if (selectedIds.length === 0) return;
    setShowDeleteDialog(true);
  }, [selectedIds]);

  const confirmDelete = useCallback(() => {
    setShowDeleteDialog(false);
    runAction('delete');
  }, [runAction]);

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

  const hasConversations = (conversations?.length ?? 0) > 0;

  return (
    <Screen>
      {/* ── Header — normal or selection mode ─────────────────────── */}
      {isSelectionMode ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: spacing.xxl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <BackButton onPress={exitSelection} />
            <Text
              style={[typeScale.h1, { color: colors.textPrimary }]}
              accessibilityLabel={`${selectedIds.length} selected`}
            >
              {selectedIds.length}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {/* Filled (heavier) icons; Archive ↔ Unarchive and
                Mark unread ↔ Mark read flip with the selected chats. */}
            <IconButton
              icon={allSelectedArchived ? 'archive-outline' : 'archive'}
              size={20}
              onPress={() => runAction(allSelectedArchived ? 'unarchive' : 'archive')}
              disabled={actionPending}
              accessibilityLabel={allSelectedArchived ? 'Unarchive selected' : 'Archive selected'}
            />
            <IconButton
              icon="trash"
              size={20}
              onPress={handleDeletePress}
              disabled={actionPending}
              accessibilityLabel="Delete selected"
            />
            <IconButton
              icon={allSelectedRead ? 'mail-unread' : 'mail-open'}
              size={20}
              onPress={() => runAction(allSelectedRead ? 'unread' : 'read')}
              disabled={actionPending}
              accessibilityLabel={allSelectedRead ? 'Mark selected as unread' : 'Mark selected as read'}
            />
          </View>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingTop: spacing.xxl,
          }}
        >
          <Text style={[typeScale.h1, { color: colors.textPrimary }]}>Chat</Text>
          <NotificationButton />
        </View>
      )}

      {/* ── Search — pinned with the header, never scrolls ────────── */}
      {hasConversations && (
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search by item or person"
            accessibilityLabel="Search messages by item or person"
          />
        </View>
      )}

      {/* ── Conversation list — filters and content scroll together ── */}
      {!hasConversations ? (
        <EmptyState
          icon="chatbubble-outline"
          title="No conversations yet"
          description="When you request a rental or an owner responds, your messages will appear here."
          actionLabel="Discover Gear"
          onAction={() => router.push(ROUTES.TABS.DISCOVER)}
        />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item: Conversation) => item.rentalId}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              onPress={() => handleCardPress(item.rentalId)}
              onLongPress={() => handleCardLongPress(item.rentalId)}
              selectionMode={isSelectionMode}
              selected={selectedIds.includes(item.rentalId)}
            />
          )}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.lg }}>
              {/* Filter tabs: All / Unread / Archived — explore-style pills */}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {FILTER_TABS.map((tab) => (
                  <Chip
                    key={tab.key}
                    label={tab.label}
                    pill
                    variant={activeTab === tab.key ? 'active' : 'default'}
                    onPress={() => setActiveTab(tab.key)}
                    disabled={isSelectionMode}
                    badgeCount={tab.key === 'archived' ? archivedWithUnread : undefined}
                  />
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={
            tabConversations.length === 0 ? (
              activeTab === 'updates' ? (
                <EmptyState
                  icon="checkmark-done-outline"
                  title="You're all caught up"
                  description="Conversations with new messages from owners or renters will appear here."
                />
              ) : activeTab === 'archived' ? (
                <EmptyState
                  icon="archive-outline"
                  title="No archived conversations"
                  description="Long-press a conversation and tap Archive to file it here."
                />
              ) : null
            ) : (
              <EmptyState
                icon="search-outline"
                title="No matching conversations"
                description="Try a different item or person name."
                actionLabel="Clear Search"
                onAction={() => setQuery('')}
              />
            )
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
          contentContainerStyle={{ paddingBottom: spacing.xxxxl }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

      {/* ── Delete confirmation — destructive, permanent → ask first ── */}
      <AlpineDialog
        visible={showDeleteDialog}
        title="Delete chat?"
        message={
          selectedIds.length === 1
            ? 'This conversation and its messages will be permanently deleted. This cannot be undone.'
            : `${selectedIds.length} conversations and their messages will be permanently deleted. This cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        destructive
        testID="delete-chat-dialog"
      />
    </Screen>
  );
}
