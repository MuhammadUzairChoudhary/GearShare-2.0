import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { AlpineHeader } from '../../components/navigation/AlpineHeader';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { useRental } from '../../hooks/useRentals';
import { useListing } from '../../hooks/useListings';
import { useRentalMessages, useSendMessage } from '../../hooks/useMessages';
import { haptics } from '../../services/feedback/haptics';
import { getAnalyticsService } from '../../services/analytics';
import { spacing, radius } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { formatTime } from '../../utils/format';
import { ROUTES } from '../../constants/routes';
import type { Message } from '../../types/message';

function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  const { colors } = useTheme();

  if (message.messageType !== 'text') {
    return (
      <View style={{ alignItems: 'center', marginVertical: spacing.sm }}>
        <AppText variant="monoSmall" color="textTertiary" align="center">
          {message.body}
        </AppText>
      </View>
    );
  }

  return (
    <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: spacing.md }}>
      <View
        style={{
          maxWidth: '80%',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.card,
          backgroundColor: mine ? colors.signalLime : colors.surfaceElevated,
          borderWidth: mine ? 0 : 1,
          borderColor: mine ? undefined : colors.border,
          borderBottomRightRadius: mine ? 4 : radius.card,
          borderBottomLeftRadius: mine ? radius.card : 4,
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
      </View>
      <Text
        style={{
          fontFamily: fontFamilies.ibmPlexMono.regular,
          fontSize: rf(8),
          lineHeight: rf(12),
          color: colors.textTertiary,
          marginTop: 2,
        }}
      >
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  const { colors } = useTheme();
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

  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const listing = rental?.listing ?? listingFallback;
  const isRenter = rental !== undefined && rental.renterId === user?.id;
  const otherParty = rental
    ? isRenter
      ? rental.owner
      : (rental.renter ?? rental.owner)
    : listingFallback?.owner;
  const otherPartyName = otherParty?.fullName ?? 'the owner';
  const listingName = listing?.gearItem?.name ?? 'Rental';

  // Stay pinned to the newest message when the thread grows.
  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <AlpineHeader
        title={otherPartyName}
        subtitle={listingName}
        onBack={() => router.back()}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item: Message) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} mine={item.senderId === user?.id} />
        )}
        contentContainerStyle={{
          padding: spacing.lg,
          flexGrow: 1,
          justifyContent: messages.length === 0 ? 'center' : 'flex-start',
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xxl }}>
            <Ionicons name="chatbubble-outline" size={40} color={colors.graphite500} />
            <AppText variant="bodyMedium" color="textSecondary" align="center">
              Say hello to {otherPartyName.split(' ')[0] ?? 'the owner'} about {listingName}.
            </AppText>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: spacing.sm,
            padding: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.white,
          }}
        >
          <RNTextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${otherPartyName.split(' ')[0] ?? 'owner'}`}
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
              textAlignVertical: 'center',
            }}
            accessibilityLabel="Message"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.button,
              backgroundColor: canSend ? colors.signalLime : colors.titanium100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
          >
            {sendMessage.isPending ? (
              <Ionicons name="time-outline" size={18} color={colors.graphite500} />
            ) : (
              <Ionicons name="arrow-up" size={18} color={canSend ? colors.carbon950 : colors.graphite500} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
