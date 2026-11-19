import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { Avatar } from './Avatar';
import { AppText } from './AppText';

/** Width of the verified tick beside the profile name (used to optically center the name). */
const VERIFIED_TICK_SIZE = 20;

export interface ProfileHeroPresence {
  label: string;
  isOnline: boolean;
}

export interface ProfileHeroProps {
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
  location?: string | null;
  presence?: ProfileHeroPresence | null;
  bio?: string | null;
  /** e.g. "March 2024" — rendered as "Member since …". */
  memberSince?: string;
  trustBadges?: string[];
  rating: { average: number; count: number } | null;
  listingCount: number;
  /** Pixels the avatar row pulls up over a cover image (Instagram style). */
  coverOverlap?: number;
  /** Hide the in-content avatar once the page scrolls — its copy (rendered in
      the fixed header layer) takes over the animation from the same spot, so
      only ONE image is ever visible. Kept mounted to keep the layout stable. */
  avatarHidden?: boolean;
  /** Ref to the avatar box — lets the Account tab measure its real on-screen
      position so the header copy lands on the exact same x and y. */
  avatarRef?: React.Ref<View>;
  /** Animated opacity for the name row — fades so it never duplicates the
      name shown in the collapsed header. */
  nameFadeOpacity?: number | Animated.AnimatedInterpolation<number>;
  testID?: string;
}

/**
 * Shared centered profile hero (Instagram / Vinted style) used by both the
 * Account tab and the public profile page so they stay visually identical:
 *
 *   avatar (blue trust ring when verified) → name + verified badge →
 *   location / presence → trust badges → bio → "Member since" → stats row
 *
 * The stats row (Rating · Reviews · Listings) is the signature "profile page"
 * element — numbers stacked over muted labels with hairline dividers.
 */
export function ProfileHero({
  name,
  avatarUrl,
  verified = false,
  location,
  presence,
  bio,
  memberSince,
  trustBadges = [],
  rating,
  listingCount,
  coverOverlap = 0,
  avatarHidden = false,
  nameFadeOpacity,
  avatarRef,
  testID,
}: ProfileHeroProps) {
  const { colors } = useTheme();

  const stats: { label: string; value: string }[] = [
    { label: 'Rating', value: rating ? rating.average.toFixed(1) : '—' },
    { label: 'Reviews', value: String(rating?.count ?? 0) },
    { label: 'Listings', value: String(listingCount) },
  ];

  return (
    <View testID={testID} style={{ alignItems: 'center', gap: spacing.sm }}>
      {/* ── Avatar — hidden by state once the page scrolls (its header-layer
          copy takes over the animation). Kept mounted for a stable layout. ── */}
      <Animated.View style={{ opacity: avatarHidden ? 0 : 1 }} accessibilityElementsHidden={avatarHidden}>
        <View ref={avatarRef} style={coverOverlap > 0 ? { marginTop: -coverOverlap } : undefined}>
          {verified ? (
            <View
              testID="avatar-verified-ring"
              style={{
                borderRadius: 9999,
                borderWidth: 3,
                borderColor: colors.verified,
                padding: 3,
                backgroundColor: colors.white,
              }}
            >
              <Avatar uri={avatarUrl ?? null} name={name} size={96} />
            </View>
          ) : (
            <Avatar uri={avatarUrl ?? null} name={name} size={96} />
          )}
        </View>
      </Animated.View>

      {/* ── Name + verified badge — fades so it can't duplicate the
          collapsed header name. The name stays optically centered: the
          pair (name + tick) centers as a unit, then shifts right by half
          the tick block so the NAME lands on screen center ──────────── */}
      <Animated.View style={{ opacity: nameFadeOpacity ?? 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.xs,
            maxWidth: '100%',
            ...(verified
              ? { transform: [{ translateX: (VERIFIED_TICK_SIZE + spacing.sm) / 2 }] }
              : {}),
          }}
        >
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fontFamilies.spaceGrotesk.bold,
            fontSize: rf(22),
            lineHeight: rf(28),
            color: colors.textPrimary,
            flexShrink: 1,
          }}
        >
          {name}
        </Text>
        {verified && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={colors.verified}
            accessibilityLabel="Verified member"
          />
        )}
        </View>
      </Animated.View>

      {/* ── Location · presence ─────────────────────────────────────── */}
      {(location || presence) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
              <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
                {location}
              </AppText>
            </View>
          )}
          {location && presence && (
            <View
              style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textTertiary }}
            />
          )}
          {presence && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: presence.isOnline ? colors.success : colors.textTertiary,
                }}
              />
              <AppText variant="bodySmall" color="textSecondary">
                {presence.label}
              </AppText>
            </View>
          )}
        </View>
      )}

      {/* ── Trust badges — quiet lime-check + neutral text, on-theme ── */}
      {trustBadges.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: spacing.lg,
            marginTop: spacing.xs,
          }}
        >
          {trustBadges.map((badge) => (
            <View
              key={badge}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
            >
              <Ionicons name="checkmark-circle" size={13} color={colors.verified} />
              <Text
                style={{
                  fontFamily: fontFamilies.inter.medium,
                  fontSize: rf(12),
                  lineHeight: rf(16),
                  color: colors.textSecondary,
                }}
              >
                {badge}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Bio ─────────────────────────────────────────────────────── */}
      {bio ? (
        <AppText
          variant="bodyMedium"
          color="textSecondary"
          style={{ textAlign: 'center', marginTop: spacing.xs, maxWidth: 340 }}
        >
          {bio}
        </AppText>
      ) : null}

      {/* ── Member since ────────────────────────────────────────────── */}
      {memberSince ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
          <AppText variant="bodySmall" color="textSecondary">
            Member since {memberSince}
          </AppText>
        </View>
      ) : null}

      {/* ── Stats row — Rating · Reviews · Listings ─────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          width: '100%',
          marginTop: spacing.lg,
        }}
      >
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 && <View style={{ width: 1, backgroundColor: colors.border }} />}
            <View style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.sm }}>
              <Text
                style={{
                  fontFamily: fontFamilies.spaceGrotesk.bold,
                  fontSize: rf(18),
                  lineHeight: rf(24),
                  color: colors.textPrimary,
                }}
              >
                {stat.value}
              </Text>
              <AppText variant="bodySmall" color="textSecondary">
                {stat.label}
              </AppText>
            </View>
          </React.Fragment>
        ))}
      </View>

    </View>
  );
}
