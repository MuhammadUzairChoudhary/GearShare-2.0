import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput as RNTextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { AlpineHeader } from '../../components/navigation/AlpineHeader';
import { AlpinePressable } from '../../components/ui/AlpinePressable';
import { Avatar } from '../../components/ui/Avatar';
import { GearPreviewSheet } from '../../components/ui/GearPreviewSheet';
import { AlpineDialog } from '../../components/ui/AlpineDialog';
import { IconButton } from '../../components/ui/IconButton';
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuTrigger,
  type OptionsMenuTriggerHandle,
} from '../../components/ui/OptionsMenu';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { useRental } from '../../hooks/useRentals';
import { useListing } from '../../hooks/useListings';
import {
  useRentalMessages,
  useSendMessage,
  useConversationActions,
} from '../../hooks/useMessages';
import { useToast } from '../../providers/ToastProvider';
import { haptics } from '../../services/feedback/haptics';
import { getAnalyticsService } from '../../services/analytics';
import { spacing, radius } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { formatTime, formatDayDivider, formatShortDate, formatPresence } from '../../utils/format';
import { ROUTES } from '../../constants/routes';
import type { Message } from '../../types/message';
import type { Listing } from '../../types/listing';

// ── Helpers ───────────────────────────────────────────────────────────────
/** WhatsApp-style read-receipt blue (deliberately outside the Alpine palette). */
const READ_BLUE = '#34B7F1';

function isSameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ── Day separator ─────────────────────────────────────────────────────────
function DayDivider({ date }: { date: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginVertical: spacing.md,
      }}
      accessibilityRole="header"
      accessibilityLabel={`Messages from ${formatDayDivider(date)}`}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text
        style={{
          fontFamily: fontFamilies.ibmPlexMono.semiBold,
          fontSize: rf(8),
          lineHeight: rf(12),
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.textSecondary,
        }}
      >
        {formatDayDivider(date)}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}

// ── System / status events (pickup confirmed, etc.) ──────────────────────
function SystemEvent({ body }: { body: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginVertical: spacing.md,
      }}
      accessibilityRole="text"
      accessibilityLabel={body}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text
        style={{
          fontFamily: fontFamilies.ibmPlexMono.semiBold,
          fontSize: rf(8),
          lineHeight: rf(12),
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.textSecondary,
          textAlign: 'center',
        }}
      >
        {body}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────
function MessageBubble({
  message,
  mine,
  otherPartyName,
}: {
  message: Message;
  mine: boolean;
  otherPartyName: string;
}) {
  const { colors } = useTheme();

  // Every non-text message (system, status_update, image placeholder) renders
  // as a readable centered event — never a faint text line.
  if (message.messageType !== 'text') {
    return <SystemEvent body={message.body} />;
  }

  const timeLabel = formatTime(message.createdAt);
  const isRead = Boolean(message.readAt);
  const a11yStatus = mine ? (isRead ? 'Read' : 'Sent') : '';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: spacing.md,
        justifyContent: mine ? 'flex-end' : 'flex-start',
      }}
      accessible
      accessibilityLabel={`${mine ? 'You' : otherPartyName}: ${message.body}. ${a11yStatus ? `${a11yStatus}. ` : ''}${timeLabel}`}
    >
      <View style={{ maxWidth: '80%' }}>
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.card,
            // Mine: theme lime, top-right corner less rounded. Theirs: white,
            // top-left corner less rounded. No strokes on either bubble.
            // Time + read ticks sit inside the bubble, bottom-right.
            backgroundColor: mine ? colors.signalLime : colors.white,
            borderTopRightRadius: mine ? 4 : radius.card,
            borderTopLeftRadius: mine ? radius.card : 4,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.inter.regular,
              fontSize: rf(13),
              lineHeight: rf(19),
              color: mine ? colors.carbon950 : colors.textPrimary,
            }}
          >
            {message.body}
          </Text>
          {mine ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 3,
                marginTop: 2,
              }}
            >
              {isRead ? (
                <Ionicons
                  name="checkmark-done"
                  size={13}
                  color={READ_BLUE}
                  // Decorative — the bubble's own label announces Read/Sent,
                  // so never double-announce on Android.
                  importantForAccessibility="no"
                />
              ) : (
                <Ionicons
                  name="checkmark"
                  size={13}
                  color={colors.graphite500}
                  importantForAccessibility="no"
                />
              )}
              <Text
                style={{
                  fontFamily: fontFamilies.ibmPlexMono.regular,
                  fontSize: rf(8),
                  lineHeight: rf(12),
                  color: mine ? colors.graphite700 : colors.textSecondary,
                }}
              >
                {timeLabel}
              </Text>
            </View>
          ) : (
            <Text
              style={{
                fontFamily: fontFamilies.ibmPlexMono.regular,
                fontSize: rf(8),
                lineHeight: rf(12),
                color: colors.textSecondary,
                marginTop: 2,
                textAlign: 'right',
              }}
            >
              {timeLabel}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Gear card — thumbnail + name + owner, tap opens the gear preview sheet ──
// Matches the rental flow's gear preview card: image left, name + owner,
// chevron right. No status readouts — those live on the rental detail.
function GearCard({
  listing,
  onPress,
}: {
  listing: Listing | null | undefined;
  onPress: (() => void) | undefined;
}) {
  const { colors } = useTheme();
  const thumb = listing?.images?.[0]?.storagePath ?? null;
  const name = listing?.gearItem?.name ?? 'Rental';
  const ownerName = listing?.owner?.fullName ?? 'Gear owner';

  return (
    <AlpinePressable
      onPress={onPress}
      disabled={!onPress}
      pressedStyle={{ backgroundColor: colors.surface }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surfaceElevated,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${name}, listed by ${ownerName}. View gear details`}
    >
      {thumb ? (
        <Image
          source={{ uri: thumb }}
          resizeMode="cover"
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.image,
            backgroundColor: colors.surface,
          }}
          accessibilityRole="image"
          accessibilityLabel={name}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.image,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.spaceGrotesk.bold,
              fontSize: rf(10),
              color: colors.textTertiary,
              textTransform: 'uppercase',
            }}
          >
            {name.slice(0, 2)}
          </Text>
        </View>
      )}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fontFamilies.spaceGrotesk.bold,
            fontSize: rf(14),
            lineHeight: rf(18),
            textTransform: 'uppercase',
            color: colors.textPrimary,
          }}
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fontFamilies.inter.bold,
            fontSize: rf(10),
            lineHeight: rf(14),
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {ownerName}
        </Text>
      </View>

      {onPress && <Ionicons name="chevron-forward" size={14} color={colors.graphite500} />}
    </AlpinePressable>
  );
}

export default function ChatScreen() {
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();

  // Real rental context; falls back to the listing so demo "Message owner"
  // flows (which pass a listing id) still open a working thread.
  const {
    data: rental,
    isLoading: rentalLoading,
    isError: rentalError,
    refetch: refetchRental,
  } = useRental(rentalId ?? '');
  const {
    data: listingFallback,
    isLoading: listingFallbackLoading,
    isError: listingFallbackError,
    refetch: refetchListing,
  } = useListing(rental ? '' : (rentalId ?? ''));

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isError: messagesError,
    refetch: refetchMessages,
  } = useRentalMessages(rentalId ?? '');
  const sendMessage = useSendMessage();
  const { mutate: runConversationAction, isPending: actionPending } = useConversationActions();
  const { showToast } = useToast();

  const [draft, setDraft] = useState('');
  // Gear preview sheet — opened from the gear card under the header.
  const [showGearSheet, setShowGearSheet] = useState(false);
  // Chat options dropdown — anchored under the header 3-dot button.
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [optionsAnchorTop, setOptionsAnchorTop] = useState(96);
  // Measures the 3-dot button's window position so the dropdown always anchors
  // directly under it (safe-area insets + header padding included).
  const optionsTriggerRef = useRef<OptionsMenuTriggerHandle>(null);
  // Delete confirmation — destructive and permanent, so it asks first.
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  // Stay pinned to the newest message only when the user is already near the
  // bottom — never yank someone who scrolled up to read history.
  const stickToEnd = useRef(true);

  const listing = rental?.listing ?? listingFallback;
  const isRenter = rental != null && rental.renterId === user?.id;
  const otherParty = rental
    ? isRenter
      ? rental.owner
      : (rental.renter ?? rental.owner)
    : listingFallback?.owner;
  const otherPartyName = otherParty?.fullName ?? 'the owner';
  const listingName = listing?.gearItem?.name ?? 'Rental';
  const firstName = otherParty ? otherPartyName.split(' ')[0] : 'owner';
  // Presence readout — "Online" when recently active, else "Last online · …".
  const presence = formatPresence(otherParty?.lastActiveAt ?? null);

  const handleOpenProfile = useCallback(() => {
    const profileId = otherParty?.id;
    if (profileId) router.push(ROUTES.PROFILE(profileId));
  }, [otherParty?.id]);

  const handleOpenOptions = useCallback(() => {
    setOptionsAnchorTop(optionsTriggerRef.current?.getAnchorTop() ?? 96);
    setShowOptionsMenu(true);
  }, []);

  const handleCall = useCallback(() => {
    haptics.selection();
    showToast('Calling isn’t available in this demo.', 'info');
  }, [showToast]);

  const handleArchiveChat = useCallback(() => {
    setShowOptionsMenu(false);
    if (!rentalId || !user?.id || actionPending) return;
    runConversationAction(
      { action: 'archive', rentalIds: [rentalId], userId: user.id },
      {
        onSuccess: () => {
          showToast('Conversation archived', 'success');
          router.back();
        },
      },
    );
  }, [rentalId, user?.id, actionPending, runConversationAction, showToast]);

  const handleDeletePress = useCallback(() => {
    setShowOptionsMenu(false);
    setShowDeleteDialog(true);
  }, []);

  const confirmDeleteChat = useCallback(() => {
    setShowDeleteDialog(false);
    if (!rentalId || !user?.id || actionPending) return;
    runConversationAction(
      { action: 'delete', rentalIds: [rentalId], userId: user.id },
      {
        onSuccess: () => {
          showToast('Conversation deleted', 'success');
          router.back();
        },
      },
    );
  }, [rentalId, user?.id, actionPending, runConversationAction, showToast]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    stickToEnd.current = distanceFromBottom < 64;
  }, []);

  const handleContentSizeChange = useCallback(() => {
    if (stickToEnd.current) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, []);

  const handleSend = useCallback(() => {
    const body = draft.trim();
    if (!body || !user?.id || !rentalId || sendMessage.isPending) return;
    sendMessage.mutate(
      { rentalId, body, senderId: user.id },
      {
        onSuccess: () => {
          setDraft('');
          haptics.action();
          getAnalyticsService().trackEvent({ name: 'message_sent', params: { rentalId } });
        },
      },
    );
  }, [draft, rentalId, user?.id, sendMessage]);

  const isLoading =
    authLoading || rentalLoading || (!rental && listingFallbackLoading) || messagesLoading;
  const isError =
    rentalError || messagesError || (!rental && !listingFallback && listingFallbackError);

  if (isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading conversation..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Chat</AppText>
          <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: spacing.sm }}>
            Sign in to message the owner.
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

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState
          onRetry={() => {
            refetchRental();
            refetchListing();
            refetchMessages();
          }}
        />
      </View>
    );
  }

  const canSend = Boolean(draft.trim()) && !sendMessage.isPending;
  // Keep the lime fill while a send is in flight so the action reads as
  // engaged, not disabled — presses stay blocked via `disabled`.
  const isActive = canSend || sendMessage.isPending;

  return (
    // Chat field is the same light grey as a pressed chat card — white
    // bubbles and the lime sender bubble sit on it without any strokes.
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Stack.Screen options={{ headerShown: false }} />
      <AlpineHeader
        title={otherPartyName}
        subtitle={presence?.label}
        avatar={{ uri: otherParty?.avatarUrl ?? null, name: otherPartyName }}
        onTitlePress={handleOpenProfile}
        onBack={() => router.back()}
        // Chat sits on the grey surface field — header takes no fill, and the
        // back button is bare (no stroke, no fill) to match the surface.
        bareBack
        // Name + presence sit on one row beside the avatar, not under it.
        subtitleInline
        trailing={
          <>
            <IconButton
              appIcon="call"
              size={16}
              bare
              onPress={handleCall}
              accessibilityLabel={`Call ${otherPartyName}`}
              style={{ width: 40, height: 40, minWidth: 40, minHeight: 40 }}
            />
            <OptionsMenuTrigger
              ref={optionsTriggerRef}
              onPress={handleOpenOptions}
              accessibilityLabel="Conversation options"
              testID="chat-options-trigger"
              bare
            />
          </>
        }
      />

      {/* Gear card — thumbnail + name + owner, opens the gear preview sheet */}
      <GearCard
        listing={listing}
        onPress={listing ? () => setShowGearSheet(true) : undefined}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item: Message) => item.id}
        renderItem={({ item, index }) => {
          const prev = messages[index - 1];
          const newDay = !prev || !isSameDay(prev.createdAt, item.createdAt);
          return (
            <>
              {newDay && <DayDivider date={item.createdAt} />}
              <MessageBubble
                message={item}
                mine={item.senderId === user?.id}
                otherPartyName={otherPartyName}
              />
            </>
          );
        }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl,
          flexGrow: 1,
          justifyContent: messages.length === 0 ? 'center' : 'flex-start',
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xxl }}>
            <Avatar uri={otherParty?.avatarUrl} name={otherPartyName} size="lg" />
            <View style={{ alignItems: 'center', gap: 2 }}>
              <AppText
                variant="titleSmall"
                align="center"
                style={{ textTransform: 'uppercase' }}
              >
                {otherPartyName}
              </AppText>
              <AppText variant="labelMedium" color="textSecondary" align="center" numberOfLines={1}>
                {listingName}
              </AppText>
            </View>
            <AppText variant="bodyMedium" color="textSecondary" align="center">
              {rental
                ? `Ask ${firstName} about pickup on ${formatShortDate(rental.startDate)} — timing, gear condition, or anything else before you book.`
                : `Ask ${firstName} about availability, pickup, or condition of ${listingName}.`}
            </AppText>
          </View>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.white,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg + insets.bottom,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
            <RNTextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={`Message ${firstName}`}
              placeholderTextColor={colors.textTertiary}
              multiline
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 120,
                backgroundColor: colors.surface,
                borderRadius: radius.input,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                fontFamily: fontFamilies.inter.regular,
                fontSize: rf(14),
                lineHeight: rf(20),
                color: colors.textPrimary,
                textAlignVertical: 'top',
              }}
              accessibilityLabel={`Message ${firstName}`}
            />
            <AlpinePressable
              onPress={handleSend}
              disabled={!canSend}
              pressedStyle={{
                backgroundColor: isActive ? colors.signalLimeDark : colors.titanium100,
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.button,
                backgroundColor: isActive ? colors.signalLime : colors.titanium100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !canSend, busy: sendMessage.isPending }}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator size="small" color={colors.carbon950} />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={canSend ? colors.carbon950 : colors.graphite500}
                />
              )}
            </AlpinePressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Gear preview sheet — same as the rental flow's product sheet */}
      <GearPreviewSheet
        visible={showGearSheet}
        listing={listing}
        onClose={() => setShowGearSheet(false)}
      />

      {/* ── Chat options — View Profile / Archive / Delete ──────────── */}
      <OptionsMenu
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        anchorTop={optionsAnchorTop}
        testID="chat-options-menu"
      >
        <OptionsMenuItem
          icon={<Ionicons name="person-outline" size={14} color={colors.textPrimary} />}
          label="View Profile"
          onPress={handleOpenProfile}
          testID="view-profile-item"
        />
        <OptionsMenuItem
          divider
          icon={<Ionicons name="archive-outline" size={14} color={colors.textPrimary} />}
          label="Archive"
          onPress={handleArchiveChat}
          testID="archive-chat-item"
        />
        <OptionsMenuItem
          divider
          icon={<Ionicons name="trash-outline" size={14} color={colors.error} />}
          label="Delete"
          onPress={handleDeletePress}
          destructive
          testID="delete-chat-item"
        />
      </OptionsMenu>

      {/* ── Delete confirmation — destructive, permanent → ask first ── */}
      <AlpineDialog
        visible={showDeleteDialog}
        title="Delete conversation?"
        message="This conversation and its messages will be permanently deleted for you. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDeleteChat}
        onCancel={() => setShowDeleteDialog(false)}
        destructive
        testID="delete-chat-dialog"
      />
    </View>
  );
}
