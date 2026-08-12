import React, { useMemo } from 'react';
import { View, ScrollView, Image, Text } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { BackButton } from '../../components/ui/BackButton';
import { Avatar } from '../../components/ui/Avatar';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Divider } from '../../components/ui/Divider';
import { AvailabilityBadge } from '../../components/ui/AvailabilityBadge';
import { MoneyText } from '../../components/ui/MoneyText';
import { AlpinePressable } from '../../components/ui/AlpinePressable';
import { ListingCardSkeleton } from '../../components/ui/ListingCardSkeleton';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useProfile } from '../../hooks/useProfile';
import { useOwnerListings } from '../../hooks/useListings';
import { spacing, radius } from '../../theme/spacing';
import { fontFamilies, typeScale } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { formatPresence, formatRelativeTime } from '../../utils/format';
import { formatMoney } from '../../utils/money';
import { ROUTES } from '../../constants/routes';
import { mockReviews, mockProfiles } from '../../mocks/data';
import { getProfileTrustBadges, profileUsername } from '../../utils/profile';
import type { Review } from '../../types/review';
import type { Listing } from '../../types/listing';

// ── Section heading — same treatment as the Account tab ───────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[typeScale.subtitle, { color: colors.textSecondary }]}>{children}</Text>;
}

/** Compact gear row — image, name, price/day + availability, chevron. */
function ListingRow({
  listing,
  onPress,
}: {
  listing: Listing;
  onPress: (id: string) => void;
}) {
  const { colors } = useTheme();
  const gear = listing.gearItem;
  const thumb = listing.images?.[0]?.storagePath ?? null;

  return (
    <AlpinePressable
      onPress={() => onPress(listing.id)}
      pressedStyle={{ backgroundColor: colors.surface }}
      accessibilityRole="button"
      accessibilityLabel={`${gear?.name ?? 'Listing'} — ${formatMoney(listing.dailyPrice, { showCode: true })} per day`}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.md,
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {thumb ? (
          <Image
            source={{ uri: thumb }}
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.image,
              backgroundColor: colors.surface,
            }}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={gear?.name ?? 'Listing'}
          />
        ) : (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.image,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="cube-outline" size={24} color={colors.textTertiary} />
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <AppText variant="titleSmall" numberOfLines={1}>
            {gear?.name ?? 'Unknown item'}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {[gear?.brand, gear?.model].filter(Boolean).join(' ')}
          </AppText>
          <MoneyText variant="dailyPrice" minorUnits={listing.dailyPrice} style={{ marginTop: 2 }} />
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing.sm }}>
          <AvailabilityBadge status={listing.availabilityStatus} />
          <Ionicons name="chevron-forward" size={14} color={colors.graphite500} />
        </View>
      </View>
    </AlpinePressable>
  );
}

/** Single review — reviewer identity, rating breakdown, feedback, date. */
function ReviewCard({ review }: { review: Review }) {
  const { colors } = useTheme();
  const reviewer = mockProfiles.find((p) => p.id === review.reviewerId);

  const breakdown: { label: string; value: number }[] = [
    { label: 'Communication', value: review.rating.communication },
    { label: 'Reliability', value: review.rating.reliability },
    { label: 'Equipment', value: review.rating.equipmentCondition },
  ];

  return (
    <Card testID="review-card">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Avatar uri={reviewer?.avatarUrl ?? null} name={reviewer?.fullName ?? 'Member'} size="sm" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="titleSmall" numberOfLines={1}>
            {reviewer?.fullName ?? 'GearShare member'}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {formatRelativeTime(review.createdAt)}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Ionicons name="star" size={14} color={colors.warning} />
          <Text style={[typeScale.monoBody, { color: colors.textPrimary }]}>
            {review.rating.overall.toFixed(1)}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.lg,
          marginTop: spacing.md,
        }}
      >
        {breakdown.map((b) => (
          <View key={b.label} style={{ gap: 2 }}>
            <Text style={[typeScale.monoMicro, { color: colors.textTertiary }]}>{b.label}</Text>
            <Text style={[typeScale.monoBody, { color: colors.textPrimary }]}>
              {b.value.toFixed(1)} / 5
            </Text>
          </View>
        ))}
      </View>

      {review.feedback && (
        <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: spacing.md }}>
          {review.feedback}
        </AppText>
      )}
    </Card>
  );
}

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfile(userId ?? '');
  const {
    data: listings = [],
    isLoading: listingsLoading,
    isError: listingsError,
    refetch: refetchListings,
  } = useOwnerListings(userId ?? '');

  const reviews = useMemo(
    () => mockReviews.filter((r) => r.reviewedUserId === userId),
    [userId],
  );

  const presence = formatPresence(profile?.lastActiveAt ?? null);
  const username = useMemo(() => profileUsername(profile ?? { fullName: '' }), [profile]);
  const trustBadges = profile ? getProfileTrustBadges(profile) : [];
  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return '';
    return new Date(profile.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [profile?.createdAt]);
  const firstName = (profile?.fullName ?? 'this member').split(' ')[0];

  const openListing = (id: string) => router.push(ROUTES.LISTING(id));

  // ── Full-page states ────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState message="Loading profile..." />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState onRetry={() => refetchProfile()} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}>
          <BackButton />
        </View>
        <EmptyState icon="person-outline" title="Member not found" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Custom header — same back button as the detail pages ───── */}
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <BackButton />
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fontFamilies.spaceGrotesk.bold,
              fontSize: rf(15),
              lineHeight: rf(20),
              color: colors.textPrimary,
            }}
          >
            {profile.fullName}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxxxl, gap: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ 1. HERO — identity & trust ═══════════════════════════════ */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <Card testID="profile-hero-card">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <Avatar uri={profile.avatarUrl} name={profile.fullName} size="xl" />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <AppText variant="titleMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {profile.fullName}
                  </AppText>
                  {profile.verificationStatus === 'verified' && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.signalLime} />
                  )}
                </View>
                <AppText variant="monoSmall" color="textSecondary" numberOfLines={1}>
                  @{username}
                </AppText>
                {profile.location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                    <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
                      {profile.location}
                    </AppText>
                  </View>
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
                    <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
                      {presence.label}
                    </AppText>
                  </View>
                )}
              </View>
            </View>

            {/* Rating summary */}
            {profile.ratingAverage !== null && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginTop: spacing.lg,
                }}
              >
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={[typeScale.monoBody, { color: colors.textPrimary }]}>
                  {profile.ratingAverage.toFixed(1)}
                </Text>
                <AppText variant="bodySmall" color="textSecondary">
                  · {profile.ratingCount} review{profile.ratingCount !== 1 ? 's' : ''}
                </AppText>
              </View>
            )}

            {/* Trust badges */}
            {trustBadges.length > 0 && (
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                {trustBadges.map((badge) => (
                  <Chip key={badge} label={badge} variant="accent" />
                ))}
              </View>
            )}

            {/* Bio */}
            {profile.bio && (
              <AppText
                variant="bodyMedium"
                color="textSecondary"
                style={{ marginTop: spacing.lg }}
              >
                {profile.bio}
              </AppText>
            )}

            {/* Member since */}
            {memberSince && (
              <>
                <Divider marginVertical={spacing.lg} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                  <AppText variant="bodySmall" color="textSecondary">
                    Member since {memberSince}
                  </AppText>
                </View>
              </>
            )}
          </Card>
        </View>

        {/* ══ 2. GEAR BY {name} ═══════════════════════════════════════ */}
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          <SectionTitle>
            Gear by {firstName}
            {listings.length > 0 ? ` (${listings.length})` : ''}
          </SectionTitle>

          {listingsLoading ? (
            <View style={{ gap: spacing.md }}>
              <ListingCardSkeleton />
              <ListingCardSkeleton />
            </View>
          ) : listingsError ? (
            <ErrorState
              title="Could not load gear"
              message="Your connection may have dropped. Try again."
              onRetry={() => refetchListings()}
            />
          ) : listings.length === 0 ? (
            <View style={{ minHeight: 220, justifyContent: 'center' }}>
              <EmptyState
                icon="briefcase-outline"
                title="No gear listed yet"
                description="This member hasn't listed any gear yet."
              />
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              {listings.map((listing) => (
                <ListingRow key={listing.id} listing={listing} onPress={openListing} />
              ))}
            </View>
          )}
        </View>

        {/* ══ 3. REVIEWS ═════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          <SectionTitle>Reviews ({reviews.length})</SectionTitle>
          {reviews.length === 0 ? (
            <View style={{ minHeight: 220, justifyContent: 'center' }}>
              <EmptyState
                icon="star-outline"
                title="No reviews yet"
                description="Reviews appear here after completed rentals."
              />
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
