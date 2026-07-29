import React, { useCallback, useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { IconButton } from '../../components/ui/IconButton';
import { Chip } from '../../components/ui/Chip';
import { ListingCard } from '../../components/ui/ListingCard';
import { ListingCardSkeleton } from '../../components/ui/ListingCardSkeleton';
import { FilterSheet, type FilterState } from '../../components/ui/FilterSheet';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useSearchListings } from '../../hooks/useListings';
import { spacing } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import { getAnalyticsService } from '../../services/analytics';
import type { Listing } from '../../types/listing';
import type { BottomSheetRef } from '../../components/ui/BottomSheet';

export default function SearchResultsScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    query?: string;
    activity?: string;
    categoryId?: string;
  }>();

  const [filters, setFilters] = useState<FilterState>({
    minPrice: undefined,
    maxPrice: undefined,
    maxDeposit: undefined,
    verifiedOwnersOnly: false,
    minRating: undefined,
    conditions: [],
    sort: 'recommended',
  });
  const [showMap, setShowMap] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filters);
  const filterSheetRef = useRef<BottomSheetRef>(null);

  const searchInput = {
    query: params.query,
    activity: params.activity as any,
    categoryId: params.categoryId,
    sort: appliedFilters.sort,
    minimumDailyPriceMinor: appliedFilters.minPrice,
    maximumDailyPriceMinor: appliedFilters.maxPrice,
    maximumDepositMinor: appliedFilters.maxDeposit,
    verifiedOwnersOnly: appliedFilters.verifiedOwnersOnly,
    minimumRating: appliedFilters.minRating,
    conditions: appliedFilters.conditions.length > 0 ? appliedFilters.conditions : undefined,
  };

  const { data: listings, isLoading, isError, refetch } = useSearchListings(searchInput);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setAppliedFilters(newFilters);
    setFilters(newFilters);
    getAnalyticsService().trackEvent({
      name: 'search_filters_applied',
      params: { filterCount: countActiveFilters(newFilters) },
    });
  }, []);

  const handleListingPress = useCallback((listingId: string) => {
    getAnalyticsService().trackEvent({
      name: 'listing_viewed',
      params: { listingId, categoryId: '', listingType: 'item', source: 'search' },
    });
    router.push(ROUTES.LISTING(listingId));
  }, []);

  const hasActiveFilters = countActiveFilters(appliedFilters) > 0;

  const filterChips: string[] = [];
  if (appliedFilters.minPrice !== undefined)
    filterChips.push(`$${appliedFilters.minPrice / 100}+/day`);
  if (appliedFilters.maxPrice !== undefined)
    filterChips.push(`≤$${appliedFilters.maxPrice / 100}/day`);
  if (appliedFilters.verifiedOwnersOnly) filterChips.push('Verified');
  if (appliedFilters.minRating !== undefined) filterChips.push(`${appliedFilters.minRating}+`);

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Search Results',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerLeft: () => (
            <IconButton
              icon="arrow-back"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            />
          ),
        }}
      />

      {/* Search summary */}
      <View style={{ paddingBottom: spacing.md, gap: spacing.sm }}>
        <AppText variant="titleMedium">{params.query || (params.activity ?? 'All gear')}</AppText>
        {listings && (
          <AppText variant="bodySmall" color="textSecondary">
            {listings.length} result{listings.length !== 1 ? 's' : ''}
          </AppText>
        )}

        {/* Filter chips */}
        {hasActiveFilters && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {filterChips.map((chip) => (
              <Chip key={chip} label={chip} variant="active" />
            ))}
            <Chip
              label="Clear All"
              variant="default"
              onPress={() =>
                handleApplyFilters({
                  minPrice: undefined,
                  maxPrice: undefined,
                  maxDeposit: undefined,
                  verifiedOwnersOnly: false,
                  minRating: undefined,
                  conditions: [],
                  sort: 'recommended',
                })
              }
            />
          </View>
        )}
      </View>

      {/* Action bar */}
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.lg,
        }}
      >
        <AppButton
          title={`Filters${hasActiveFilters ? ` (${countActiveFilters(appliedFilters)})` : ''}`}
          onPress={() => filterSheetRef.current?.open()}
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          size="sm"
        />
        <AppButton
          title={showMap ? 'List' : 'Map'}
          onPress={() => setShowMap(!showMap)}
          variant="ghost"
          size="sm"
        />
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={{ gap: spacing.lg }}>
          {[1, 2, 3].map((i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !listings || listings.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results found"
          description="Try adjusting your filters or search term."
          actionLabel="Clear Filters"
          onAction={() =>
            handleApplyFilters({
              minPrice: undefined,
              maxPrice: undefined,
              maxDeposit: undefined,
              verifiedOwnersOnly: false,
              minRating: undefined,
              conditions: [],
              sort: 'recommended',
            })
          }
        />
      ) : showMap ? (
        <MapPlaceholder listings={listings} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item: Listing) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing.lg }}>
              <ListingCard listing={item} onPress={handleListingPress} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: spacing.xxxxl }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        ref={filterSheetRef}
        currentFilters={filters}
        onApply={handleApplyFilters}
        resultCount={listings?.length}
      />
    </Screen>
  );
}

function MapPlaceholder({ listings }: { listings: Listing[] }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
      }}
    >
      <Ionicons name="map-outline" size={48} color={colors.graphite500} />
      <AppText variant="bodyMedium" color="textSecondary" align="center">
        Map view is not yet configured.
      </AppText>
      <AppText variant="bodySmall" color="textTertiary" align="center">
        {listings.length} listing{listings.length !== 1 ? 's' : ''} available
      </AppText>
    </View>
  );
}

function countActiveFilters(f: FilterState): number {
  let count = 0;
  if (f.minPrice !== undefined) count++;
  if (f.maxPrice !== undefined) count++;
  if (f.maxDeposit !== undefined) count++;
  if (f.verifiedOwnersOnly) count++;
  if (f.minRating !== undefined) count++;
  count += f.conditions.length;
  if (f.sort !== 'recommended') count++;
  return count;
}
