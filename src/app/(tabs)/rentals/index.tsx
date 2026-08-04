import React, { useEffect, useMemo, useState } from 'react';
import { View, SectionList, RefreshControl, Text, type SectionListData } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { RentalSummaryCard } from '../../../components/ui/RentalSummaryCard';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Chip } from '../../../components/ui/Chip';
import { useUserRentals } from '../../../hooks/useRentals';
import { spacing, radius } from '../../../theme/spacing';
import { fontFamilies, typeScale } from '../../../theme/typography';
import { rf } from '../../../theme/responsiveFont';
import { useTheme } from '../../../theme/ThemeContext';
import { ROUTES } from '../../../constants/routes';
import { getAnalyticsService } from '../../../services/analytics';
import type { Rental, RentalStatus } from '../../../types/rental';

type FilterTab = 'all' | 'upcoming' | 'past';

const TERMINAL_STATUSES: RentalStatus[] = ['completed', 'cancelled'];
const ATTENTION_STATUSES: RentalStatus[] = ['action_required', 'return_due', 'under_review'];

interface RentalsSection {
  title: string;
  data: Rental[];
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

export default function RentalsScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const {
    data: rentals,
    isLoading: rentalsLoading,
    isError,
    refetch,
    isFetching,
  } = useUserRentals(isAuthenticated ? (user?.id ?? '') : '');

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    getAnalyticsService().trackEvent({ name: 'rentals_viewed', params: { filter: activeTab } });
  }, [activeTab]);

  const upcomingRentals = useMemo(
    () => (rentals ?? []).filter((r) => !TERMINAL_STATUSES.includes(r.status)),
    [rentals],
  );
  const pastRentals = useMemo(
    () => (rentals ?? []).filter((r) => TERMINAL_STATUSES.includes(r.status)),
    [rentals],
  );
  const needsAttentionCount = useMemo(
    () => (rentals ?? []).filter((r) => ATTENTION_STATUSES.includes(r.status)).length,
    [rentals],
  );

  const sections = useMemo<RentalsSection[]>(() => {
    if (activeTab === 'all') {
      return [
        ...(upcomingRentals.length > 0 ? [{ title: 'Upcoming', data: upcomingRentals }] : []),
        ...(pastRentals.length > 0 ? [{ title: 'Past', data: pastRentals }] : []),
      ];
    }
    if (activeTab === 'upcoming') {
      return upcomingRentals.length > 0 ? [{ title: 'Upcoming', data: upcomingRentals }] : [];
    }
    return pastRentals.length > 0 ? [{ title: 'Past', data: pastRentals }] : [];
  }, [activeTab, upcomingRentals, pastRentals]);

  if (authLoading) {
    return (
      <Screen>
        <LoadingState message="Loading rentals..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">My Rentals</AppText>
          <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: spacing.sm }}>
            Sign in to see your rentals.
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

  if (rentalsLoading) {
    return (
      <Screen>
        <LoadingState message="Loading rentals..." />
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

  const handleRentalPress = (rentalId: string) => {
    router.push(ROUTES.RENTAL(rentalId));
  };

  const attentionLabel =
    needsAttentionCount === 1
      ? '1 rental needs your attention'
      : `${needsAttentionCount} rentals need your attention`;

  const renderSectionHeader = ({ section }: { section: SectionListData<Rental> }) => {
    const count = section.data.length;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingTop: spacing.xl,
          paddingBottom: spacing.md,
        }}
      >
        <Text style={[typeScale.subtitle, { color: colors.textSecondary }]}>{section.title}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={[typeScale.monoSmall, { color: colors.textTertiary }]}>{count}</Text>
      </View>
    );
  };

  return (
    <Screen>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={{ paddingTop: spacing.xxl, gap: spacing.xs }}>
        <Text style={[typeScale.h1, { color: colors.textPrimary }]}>My Rentals</Text>
        <Text style={[typeScale.monoSmall, { color: colors.textSecondary }]}>
          {upcomingRentals.length} upcoming · {pastRentals.length} past
        </Text>
      </View>

      {/* ── Needs-attention strip — explicit, actionable, never decorative ── */}
      {needsAttentionCount > 0 && (
        <View
          style={{
            marginTop: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.carbon850,
            borderRadius: radius.input,
            borderWidth: 1,
            borderColor: colors.graphite700,
          }}
        >
          <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
          <Text
            style={{
              flex: 1,
              fontFamily: fontFamilies.inter.semiBold,
              fontSize: rf(11),
              lineHeight: rf(16),
              color: colors.titanium50,
            }}
          >
            {attentionLabel}
          </Text>
        </View>
      )}

      {/* ── Filter chips ───────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg }}>
        {FILTER_TABS.map((tab) => (
          <Chip
            key={tab.key}
            label={tab.label}
            variant={activeTab === tab.key ? 'active' : 'default'}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      {/* ── List / empty states ────────────────────────────────────── */}
      {!rentals || rentals.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No rentals yet"
          description="Rent gear from nearby owners — requests, pickups, and returns will appear here."
          actionLabel="Find Gear"
          onAction={() => router.push(ROUTES.TABS.DISCOVER)}
        />
      ) : sections.length === 0 ? (
        activeTab === 'upcoming' ? (
          <EmptyState
            icon="calendar-outline"
            title="No upcoming rentals"
            description="Your requests, bookings, and active rentals will appear here."
            actionLabel="Find Gear"
            onAction={() => router.push(ROUTES.TABS.DISCOVER)}
          />
        ) : (
          <EmptyState
            icon="time-outline"
            title="No past rentals"
            description="Completed and cancelled rentals appear here for reference."
          />
        )
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item: Rental) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing.lg }}>
              <RentalSummaryCard
                rental={item}
                currentUserId={user?.id}
                onPress={() => handleRentalPress(item.id)}
              />
            </View>
          )}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxxxl }}
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
