import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AlpinePressable } from './AlpinePressable';
import { Avatar } from './Avatar';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { formatRelativeTime } from '../../utils/format';
import type { Conversation } from '../../types/message';

/** Matches the notification-bell red on the dashboard. */
const UNREAD_RED = '#EF4444';

interface ConversationCardProps {
  conversation: Conversation;
  onPress?: () => void;
  /** Long-press enters selection mode. */
  onLongPress?: () => void;
  /** True while the list is in selection mode — shows the tick circles. */
  selectionMode?: boolean;
  /** True when this card is checked in selection mode. */
  selected?: boolean;
  testID?: string;
}

/**
 * A conversation thread in the Chat tab — a borderless, person-first list row.
 *
 * Hierarchy (one line each, scan-friendly) — a definite gray ramp on white:
 *   1. Owner name       → textPrimary  (near-black, bold, largest)
 *   2. Gear + context   → graphite700  (dark, medium)
 *   3. Message preview  → textSecondary (mid gray, regular)
 *   4. Timestamp        → textSecondary (mid gray, but tiny mono → lightest)
 * Separation comes from spacing, not borders.
 */
export function ConversationCard({
  conversation,
  onPress,
  onLongPress,
  selectionMode = false,
  selected = false,
  testID,
}: ConversationCardProps) {
  const { colors } = useTheme();
  const { otherParty, listingName, contextLabel, lastMessage, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;

  const unreadLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <AlpinePressable
      onPress={onPress}
      onLongPress={onLongPress}
      // Keep the selected tint while pressed — don't let the press state wash it out.
      pressedStyle={{ backgroundColor: selected ? colors.titanium100 : colors.surface }}
      style={{
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        // Selection mode tints the whole row so the checked state reads at a glance.
        backgroundColor: selected ? colors.titanium100 : undefined,
      }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${unreadCount > 0 ? `${unreadCount} unread messages. ` : ''}Conversation with ${otherParty.fullName} about ${listingName}`}
      accessibilityState={{ selected: selectionMode ? selected : undefined }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {/* ── Owner avatar — left column. In selection mode the tick sits
             on the avatar's bottom-right corner. ──────────────────── */}
        <View>
          <Avatar
            uri={otherParty.avatarUrl}
            name={otherParty.fullName}
            size={48}
            accessibilityLabel={`${otherParty.fullName}'s avatar`}
          />
          {selectionMode && (
            <View
              style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selected ? colors.white : colors.graphite300,
                backgroundColor: selected ? colors.signalLime : colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel={selected ? 'Selected' : 'Not selected'}
            >
              {selected && (
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.bold,
                    fontSize: rf(10),
                    lineHeight: rf(12),
                    color: colors.carbon950,
                  }}
                >
                  ✓
                </Text>
              )}
            </View>
          )}
        </View>

        {/* ── Text column ─────────────────────────────────────────── */}
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          {/* Row 1: owner name + unread circle hugging the name, timestamp right */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                flexShrink: 1,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  flexShrink: 1,
                  fontFamily: fontFamilies.spaceGrotesk.bold,
                  fontSize: rf(14),
                  lineHeight: rf(19),
                  letterSpacing: -0.3,
                  color: colors.textPrimary,
                }}
              >
                {otherParty.fullName}
              </Text>
              {hasUnread && (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    paddingHorizontal: 4,
                    borderRadius: 9,
                    backgroundColor: UNREAD_RED,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel={`${unreadCount} unread messages`}
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
            <View style={{ flex: 1 }} />
            {lastMessage && (
              <Text
                numberOfLines={1}
                style={{
                  // Unread threads: heavier weight + theme black timestamp so
                  // the card reads as "has new messages" at a glance.
                  fontFamily: hasUnread
                    ? fontFamilies.ibmPlexMono.semiBold
                    : fontFamilies.ibmPlexMono.regular,
                  fontSize: rf(8),
                  lineHeight: rf(12),
                  color: hasUnread ? colors.textPrimary : colors.textSecondary,
                }}
              >
                {formatRelativeTime(lastMessage.createdAt)}
              </Text>
            )}
          </View>

          {/* Row 2: gear name + context — steps lighter on unread cards so the
              black preview below stays the focal line, not an inversion. */}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fontFamilies.inter.medium,
              fontSize: rf(12),
              lineHeight: rf(17),
              color: hasUnread ? colors.graphite500 : colors.graphite700,
            }}
          >
            {listingName}
            {contextLabel ? ` · ${contextLabel}` : ''}
          </Text>

          {/* Row 3: last message preview — heavier + theme black when unread */}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: hasUnread
                ? fontFamilies.inter.semiBold
                : fontFamilies.inter.regular,
              fontSize: rf(12),
              lineHeight: rf(17),
              color: hasUnread ? colors.textPrimary : colors.textSecondary,
            }}
          >
            {lastMessage?.body ?? 'Tap to start the conversation'}
          </Text>
        </View>
      </View>
    </AlpinePressable>
  );
}
