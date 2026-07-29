import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { SearchBar } from '../../../components/ui/SearchBar';
import { ActivityChip } from '../../../components/ui/ActivityChip';
import { DateRangeSelector } from '../../../components/ui/DateRangeSelector';
import { ListingCard } from '../../../components/ui/ListingCard';
import { ListingCardSkeleton } from '../../../components/ui/ListingCardSkeleton';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Divider } from '../../../components/ui/Divider';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { useFeaturedListings } from '../../../hooks/useListings';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { useSearchStore } from '../../../stores/useSearchStore';
import { spacing } from '../../../theme/spacing';
import { ROUTES } from '../../../constants/routes';
import { getAnalyticsService } from '../../../services/analytics';
import { ACTIVITY_SHORTCUTS, mockListings } from '../../../mocks/data';
import type { Listing } from '../../../types/listing';
import type { ActivityType } from '../../../types/search';

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthContext();
  const { query, setQuery, setCategory } = useSearchStore();
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showLocation, setShowLocation] = useState(false);

  const { data: featured, isLoading, isError, refetch } = useFeaturedListings();

  useEffect(() => {
    getAnalyticsService().trackEvent({ name: 'discover_viewed' });
  }, []);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      getAnalyticsService().trackEvent({
        name: 'search_submitted',
        params: {
          query: query.trim(),
          category: selectedActivity ?? undefined,
          hasDates: Boolean(startDate && endDate),
        },
      });
      router.push({
        pathname: '/search',
        params: { query: query.trim(), activity: selectedActivity ?? undefined },
      });
    }
  }, [query, selectedActivity, startDate, endDate]);

  const handleActivityPress = useCallback(
    (activity: ActivityType) => {
      const newActivity = selectedActivity === activity ? null : activity;
      setSelectedActivity(newActivity);
      if (newActivity) {
        setCategory(newActivity);
        router.push({
          pathname: '/search',
          params: { activity: newActivity },
        });
      }
    },
    [selectedActivity, setCategory],
  );

  const handleListingPress = useCallback((listingId: string) => {
    getAnalyticsService().trackEvent({
      name: 'listing_viewed',
      params: { listingId, categoryId: '', listingType: 'item', source: 'discover' },
    });
    router.push(ROUTES.LISTING(listingId));
  }, []);

  const recentlyViewed = mockListings.slice(0, 2);
  const bundles = mockListings.filter((l) => l.id === 'listing-13');

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={
          <View style={{ paddingTop: spacing.xxxl }}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <View>
                <AppText variant="displayMedium">Discover</AppText>
                <AppText variant="bodyMedium" color="textSecondary">
                  Find the perfect gear
                </AppText>
              </View>
              {isAuthenticated && (
                <TouchableOpacity
                  onPress={() => router.push(ROUTES.TABS.ACCOUNT)}
                  accessibilityLabel="Account"
                >
                  <Ionicons name="person-circle-outline" size={32} color={colors.textPrimary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Location selector */}
            <TouchableOpacity
              onPress={() => setShowLocation(!showLocation)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.lg,
              }}
            >
              <Ionicons name="location-outline" size={18} color={colors.signalLime} />
              <AppText variant="bodyMedium" color="textSecondary">
                {showLocation ? 'Portland, OR' : 'Set location'}
              </AppText>
              <Ionicons name="chevron-down" size={16} color={colors.graphite500} />
            </TouchableOpacity>

            {/* Search bar */}
            <View style={{ marginBottom: spacing.lg }}>
              <SearchBar value={query} onChangeText={setQuery} onSubmit={handleSearch} />
            </View>

            {/* Date selector */}
            <View style={{ marginBottom: spacing.xl }}>
              <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </View>

            {/* Activity shortcuts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.xxl }}
            >
              {ACTIVITY_SHORTCUTS.map((shortcut) => (
                <ActivityChip
                  key={shortcut.type}
                  icon={shortcut.icon as any}
                  label={shortcut.label}
                  isSelected={selectedActivity === shortcut.type}
                  onPress={() => handleActivityPress(shortcut.type)}
                />
              ))}
            </ScrollView>

            {/* Saved & List Gear */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl }}>
              <Card
                onPress={() =>
                  isAuthenticated
                    ? router.push(ROUTES.TABS.ACCOUNT)
                    : router.push(ROUTES.AUTH.SIGN_IN)
                }
                style={{ flex: 1 }}
              >
                <View style={{ alignItems: 'center', gap: spacing.xs }}>
                  <Ionicons name="heart-outline" size={24} color={colors.textSecondary} />
                  <AppText variant="bodySmall" color="textSecondary">
                    Saved
                  </AppText>
                </View>
              </Card>
              <Card
                onPress={() =>
                  isAuthenticated
                    ? router.push('/owner/listing/new')
                    : router.push(ROUTES.AUTH.SIGN_IN)
                }
                style={{ flex: 1 }}
              >
                <View style={{ alignItems: 'center', gap: spacing.xs }}>
                  <Ionicons name="add-circle-outline" size={24} color={colors.signalLime} />
                  <AppText variant="bodySmall" color="signalLime">
                    List Gear
                  </AppText>
                </View>
              </Card>
            </View>

            {/* Recently viewed */}
            {recentlyViewed.length > 0 && (
              <View style={{ marginBottom: spacing.xxl }}>
                <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
                  Recently viewed
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: spacing.md }}
                >
                  {recentlyViewed.map((listing) => (
                    <View key={listing.id} style={{ width: 280 }}>
                      <ListingCard listing={listing} onPress={handleListingPress} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bundles */}
            {bundles.length > 0 && (
              <View style={{ marginBottom: spacing.xxl }}>
                <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
                  Equipment bundles
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: spacing.md }}
                >
                  {bundles.map((bundle) => (
                    <View key={bundle.id} style={{ width: 280 }}>
                      <ListingCard listing={bundle} onPress={handleListingPress} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Section header for recommended */}
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Recommended nearby
            </AppText>
          </View>
        }
        data={isLoading ? [] : isError ? [] : featured}
        keyExtractor={(item: Listing) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: spacing.lg }}>
            <ListingCard listing={item} onPress={handleListingPress} />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: spacing.lg }}>
              {[1, 2, 3].map((i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </View>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No listings yet"
              description="Check back soon for available equipment."
            />
          )
        }
        contentContainerStyle={{ paddingBottom: spacing.xxxxl }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
