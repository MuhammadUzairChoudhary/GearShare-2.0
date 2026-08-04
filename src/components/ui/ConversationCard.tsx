import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from './AppText';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { formatRelativeTime } from '../../utils/format';
import type { Conversation } from '../../types/message';

interface ConversationCardProps {
  conversation: Conversation;
  onPress?: () => void;
  testID?: string;
}

/**
 * A conversation thread in the Chat tab: avatar, other party, listing,
 * last-message preview, relative time, and an unread badge (capped at 9+).
 */
export function ConversationCard({ conversation, onPress, testID }: ConversationCardProps) {
  const { colors } = useTheme();
  const { otherParty, listingName, lastMessage, unreadCount } = conversation;

  const unreadLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <Card
      onPress={onPress}
      padded={false}
      testID={testID}
      accessibilityLabel={`${unreadCount > 0 ? `${unreadCount} unread. ` : ''}Conversation with ${otherParty.fullName} about ${listingName}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg }}>
        <Avatar uri={otherParty.avatarUrl} name={otherParty.fullName} size="md" />

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
            <AppText
              variant="titleSmall"
              numberOfLines={1}
              style={unreadCount > 0 ? { fontFamily: fontFamilies.spaceGrotesk.bold } : undefined}
            >
              {otherParty.fullName}
            </AppText>
            {lastMessage && (
              <AppText variant="bodySmall" color="textTertiary">
                {formatRelativeTime(lastMessage.createdAt)}
              </AppText>
            )}
          </View>

          <AppText
            variant="bodySmall"
            color={unreadCount > 0 ? 'textPrimary' : 'textSecondary'}
            numberOfLines={1}
          >
            {lastMessage?.body ?? 'Tap to start the conversation'}
          </AppText>

          <AppText variant="labelSmall" color="textTertiary" numberOfLines={1}>
            {listingName}
          </AppText>
        </View>

        {unreadCount > 0 && (
          <View
            style={{
              minWidth: 18,
              height: 18,
              paddingHorizontal: 5,
              borderRadius: 9,
              backgroundColor: colors.error,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.inter.bold,
                fontSize: rf(9),
                lineHeight: rf(12),
                color: colors.white,
              }}
            >
              {unreadLabel}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
