import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon } from '../../components/ui/Icons';
import { useTheme } from '../../theme/ThemeContext';
import { fontFamilies } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { rf } from '../../theme/responsiveFont';
import { AppText } from '../../components/ui/AppText';
import { BackButton } from '../../components/ui/BackButton';
import { ListingCardSkeleton } from '../../components/ui/ListingCardSkeleton';
import { FilterSheet, type FilterState } from '../../components/ui/FilterSheet';
import type { BottomSheetRef } from '../../components/ui';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useSearchListings } from '../../hooks/useListings';
import { ROUTES } from '../../constants/routes';
import { getAnalyticsService } from '../../services/analytics';
import { formatMoney } from '../../utils/money';
import type { Listing } from '../../types/listing';

export default function SearchResultsScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ query?: string; activity?: string; categoryId?: string }>();

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

  const searchInput = useMemo(
    () => ({
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
    }),
    [params.query, params.activity, params.categoryId, appliedFilters],
  );

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
  const resultCount = listings?.length ?? 0;

  // =========================================================================
  // RENDER: Listing card (Figma CSS — vertical, 335×395)
  // =========================================================================
  const renderListingCard = useCallback(
    (listing: Listing) => {
      const gear = listing.gearItem;
      const total = listing.dailyPrice * 3;
      const rating = listing.owner?.ratingAverage ?? 0;
      const reviewCount = listing.owner?.ratingCount ?? 0;
      const priceMinor = listing.dailyPrice;
      const depositMinor = listing.depositAmount;
      const distance = `${(1.2 + ((listing.id.charCodeAt(listing.id.length - 1) % 20) + 1) * 0.1).toFixed(1)} km away`;
      const location = listing.pickupArea?.split(',')[0] ?? 'Chamonix';

      const figmaCardBg = isDark ? colors.carbon850 : '#F8F9F9';
      const figmaBorder = isDark ? colors.graphite700 : '#DDE1E3';
      const figmaTextDark = isDark ? colors.titanium100 : '#1F2225';
      const figmaTextLabel = isDark ? 'rgba(236,238,239,0.4)' : 'rgba(44,48,52,0.4)';
      const figmaTextSecondary = isDark ? 'rgba(236,238,239,0.6)' : 'rgba(44,48,52,0.6)';
      const figmaWhite = isDark ? 'rgba(23,26,28,0.9)' : 'rgba(255,255,255,0.9)';

      return (
        <TouchableOpacity
          key={listing.id}
          activeOpacity={0.85}
          onPress={() => handleListingPress(listing.id)}
          style={{
            backgroundColor: figmaCardBg,
            borderWidth: 1,
            borderColor: figmaBorder,
            borderRadius: radius.card,
            overflow: 'hidden',
            marginBottom: spacing.xl,
          }}
          accessibilityLabel={`${gear?.name ?? 'Listing'} — ${formatMoney(priceMinor)} per day`}
        >
          {/* ── Image area ── */}
          <View style={{ width: '100%', height: 224, backgroundColor: colors.surface }}>
            {listing.images?.[0]?.storagePath ? (
              <Image
                source={{ uri: listing.images[0].storagePath }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: colors.graphite300, opacity: 0.3 }} />
            )}

            {/* Rating — top-left, inline text, no box */}
            <View
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: figmaWhite,
                borderWidth: 1,
                borderColor: figmaBorder,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.inter.bold,
                  fontSize: rf(10),
                  lineHeight: rf(15),
                  color: figmaTextDark,
                }}
              >
                <Text style={{ color: '#FACC15' }}>★</Text> {rating.toFixed(1)} ({reviewCount})
              </Text>
            </View>

            {/* Heart button — top-right */}
            <View
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                backgroundColor: figmaWhite,
                borderWidth: 1,
                borderColor: figmaBorder,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="heart-outline" size={16} color={figmaTextDark} />
            </View>

            {/* Category badge — bottom-left */}
            {gear?.category && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  backgroundColor: '#1F2225',
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.ibmPlexMono.regular,
                    fontSize: rf(9),
                    lineHeight: rf(14),
                    letterSpacing: 0.9,
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                  }}
                >
                  {gear.category.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>

          {/* ── Content area ── */}
          <View style={{ padding: 20, gap: 8 }}>
            {/* Title — natural case */}
            <Text
              numberOfLines={2}
              style={{
                fontFamily: fontFamilies.spaceGrotesk.bold,
                fontSize: rf(16),
                lineHeight: rf(24),
                letterSpacing: -0.4,
                color: figmaTextDark,
              }}
            >
              {gear?.name ?? 'Unknown Item'}
            </Text>

            {/* Location */}
            <Text
              style={{
                fontFamily: fontFamilies.inter.medium,
                fontSize: rf(11),
                lineHeight: rf(16),
                color: figmaTextSecondary,
              }}
            >
              {distance} • {location}
            </Text>

            {/* Spacer before pricing */}
            <View style={{ height: 4 }} />

            {/* Daily rate — prominent */}
            <Text
              style={{
                fontFamily: fontFamilies.spaceGrotesk.bold,
                fontSize: rf(20),
                lineHeight: rf(28),
                color: figmaTextDark,
              }}
            >
              {formatMoney(priceMinor)}<Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), color: figmaTextSecondary }}> /day</Text>
            </Text>

            {/* Est. total + deposit — same line, muted */}
            <Text
              style={{
                fontFamily: fontFamilies.inter.regular,
                fontSize: rf(11),
                lineHeight: rf(16),
                color: figmaTextLabel,
              }}
            >
              {formatMoney(total)} est. total • {formatMoney(depositMinor)} deposit
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, isDark, handleListingPress],
  );

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header with blur backdrop ──────────────────────────────── */}
      <View
        style={{
          backgroundColor: isDark ? 'rgba(23,26,28,0.8)' : 'rgba(255,255,255,0.8)',
          paddingTop: spacing.xxxxxl,
          paddingHorizontal: 0,
        }}
      >
        {/* Top row: back + search + filter */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            gap: 16,
            paddingBottom: 12,
          }}
        >
          {/* Back button */}
          <BackButton />

          {/* Search bar */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              height: 40,
              paddingHorizontal: 16,
              gap: 12,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.card,
            }}
          >
            <Ionicons name="search-outline" size={12} color={colors.graphite500} />
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: fontFamilies.inter.semiBold,
                fontSize: rf(12),
                lineHeight: rf(16),
                color: colors.textPrimary,
                letterSpacing: 0.003,
              }}
            >
              {params.query || params.activity || 'All Gear'}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Clear search"
            >
              <AppIcon name="close" size={12} color="#ABACAE" />
            </TouchableOpacity>
          </View>

          {/* Filter button */}
          <TouchableOpacity
            onPress={() => filterSheetRef.current?.open()}
            style={{
              width: 40,
              height: 40,
              backgroundColor: colors.carbon950,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Open filters"
          >
            <AppIcon name="filters" size={14} color={colors.signalLime} />
          </TouchableOpacity>
        </View>


      </View>

      {showMap ? (
        <MapPreview
          listings={listings ?? []}
          onListingPress={handleListingPress}
          onToggleView={() => setShowMap(false)}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 112 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Results header + List/Map toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: spacing.xl,
              paddingTop: 32,
              paddingBottom: 24,
            }}
          >
            {/* Title */}
            <View style={{ gap: 2 }}>
              <Text
                style={{
                  fontFamily: fontFamilies.ibmPlexMono.semiBold,
                  fontSize: rf(10),
                  lineHeight: rf(15),
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: isDark ? 'rgba(236,238,239,0.4)' : 'rgba(44,48,52,0.4)',
                }}
              >
                Search Results
              </Text>
              <Text
                style={{
                  fontFamily: fontFamilies.spaceGrotesk.bold,
                  fontSize: rf(18),
                  lineHeight: rf(28),
                  color: colors.textPrimary,
                }}
              >
                {resultCount} item{resultCount !== 1 ? 's' : ''} found
              </Text>
            </View>

            {/* List/Map toggle */}
            <View
              style={{
                flexDirection: 'row',
                padding: 4,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.card,
                gap: 0,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowMap(false)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  backgroundColor: !showMap ? (isDark ? colors.carbon950 : '#1F2225') : 'transparent',
                  borderRadius: 7,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.bold,
                    fontSize: rf(10),
                    lineHeight: rf(15),
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: !showMap ? colors.white : (isDark ? 'rgba(236,238,239,0.4)' : 'rgba(44,48,52,0.4)'),
                  }}
                >
                  List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowMap(true)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  backgroundColor: showMap ? (isDark ? colors.carbon950 : '#1F2225') : 'transparent',
                  borderRadius: 7,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.bold,
                    fontSize: rf(10),
                    lineHeight: rf(15),
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: showMap ? colors.white : (isDark ? 'rgba(236,238,239,0.4)' : 'rgba(44,48,52,0.4)'),
                  }}
                >
                  Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Listing cards or states ──────────────────────────────── */}
          {isLoading ? (
            <View style={{ paddingHorizontal: spacing.xl }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ marginBottom: spacing.xl }}>
                  <ListingCardSkeleton />
                </View>
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
          ) : (
            <View style={{ paddingHorizontal: spacing.xl }}>
              {listings.map((listing) => renderListingCard(listing))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Filter Sheet ────────────────────────────────────────────── */}
      <FilterSheet
        ref={filterSheetRef}
        currentFilters={filters}
        onApply={(newFilters) => {
          handleApplyFilters(newFilters);
          filterSheetRef.current?.close();
        }}
        resultCount={resultCount}
      />
    </View>
  );
}

// ── Map Preview ──────────────────────────────────────────────────────────
const MAP_MARKERS = [
  { left: '22%', top: '34%', price: 35 },
  { left: '62%', top: '25%', price: 52 },
  { left: '76%', top: '52%', price: 28 },
  { left: '42%', top: '43%', price: 60 },
  { left: '18%', top: '48%', price: 45, selected: true },
] as const;

function MapPreview({
  listings,
  onListingPress,
  onToggleView,
}: {
  listings: Listing[];
  onListingPress: (id: string) => void;
  onToggleView: () => void;
}) {
  const { colors, isDark } = useTheme();
  const [selectedMarker, setSelectedMarker] = useState<number>(Math.min(4, listings.length - 1));
  const previewListing = listings[selectedMarker ?? 0];
  const gear = previewListing?.gearItem;
  const owner = previewListing?.owner;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* ── Map background ──────────────────────────────────────────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E2E8F0' }}>
        {/* Radial gradient blurs */}
        <View
          style={{
            position: 'absolute',
            width: 128,
            height: 64,
            left: 37,
            top: '18%',
            backgroundColor: colors.iceBlue,
            opacity: 0.2,
            borderRadius: 9999,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: 192,
            height: 96,
            right: 18,
            bottom: '32%',
            backgroundColor: colors.iceBlue,
            opacity: 0.3,
            borderRadius: 9999,
          }}
        />
        {/* Grid lines */}
        <View
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            borderWidth: 0,
            borderColor: colors.iceBlue,
          }}
        />
      </View>

      {/* ── Map markers ────────────────────────────────────────────── */}
      {MAP_MARKERS.map((marker, i) => {
        const isSelected = selectedMarker === i;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setSelectedMarker(i);
              if (isSelected && previewListing) {
                onListingPress(previewListing.id);
              }
            }}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              left: marker.left,
              top: marker.top,
              alignItems: 'center',
              zIndex: isSelected ? 10 : 5,
            }}
          >
            {/* Marker pill */}
            <View
              style={{
                paddingHorizontal: isSelected ? 17.8 : 12,
                paddingVertical: isSelected ? 9.55 : 9.5,
                backgroundColor: isSelected ? '#0F172A' : colors.white,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? colors.white : '#E2E8F0',
                borderRadius: 9999,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: isSelected ? 10 : 4 },
                shadowOpacity: 0.15,
                shadowRadius: isSelected ? 15 : 6,
                elevation: isSelected ? 8 : 4,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.inter.bold,
                  fontSize: isSelected ? rf(15) : rf(12),
                  lineHeight: isSelected ? 22 : 16,
                  color: isSelected ? colors.white : '#1E293B',
                  letterSpacing: isSelected ? 0.018 : 0.02,
                }}
              >
                ${marker.price}
              </Text>
            </View>

            {/* Pointer dot */}
            <View
              style={{
                width: 4,
                height: 8,
                backgroundColor: isSelected ? '#0F172A' : colors.white,
                marginTop: -2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: isSelected ? 10 : 4 },
                shadowOpacity: 0.1,
                shadowRadius: isSelected ? 10 : 4,
                elevation: isSelected ? 6 : 3,
              }}
            />

            {/* Selected border ring */}
            {isSelected && (
              <View
                style={{
                  position: 'absolute',
                  width: 71.34,
                  height: 58,
                  left: -4,
                  top: -2,
                  borderWidth: 2,
                  borderColor: colors.iceBlue,
                  borderRadius: 9999,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}

      {/* ── List/Map toggle (overlay at top-right) ──────────────────── */}
      <View style={{ position: 'absolute', top: 29, right: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            padding: 4,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: '#DDE1E3',
            borderRadius: radius.card,
            gap: 0,
          }}
        >
          <TouchableOpacity
            onPress={onToggleView}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              backgroundColor: colors.carbon950,
              borderRadius: 7,
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.inter.bold,
                fontSize: rf(10),
                lineHeight: rf(15),
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: colors.white,
              }}
            >
              List
            </Text>
          </TouchableOpacity>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 7,
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.inter.bold,
                fontSize: rf(10),
                lineHeight: rf(15),
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'rgba(44,48,52,0.4)',
              }}
            >
              Map
            </Text>
          </View>
        </View>
      </View>

      {/* ── Preview card at bottom ──────────────────────────────────── */}
      {previewListing && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingBottom: 16,
          }}
        >
          <View
            style={{
              padding: 16,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: '#F1F5F9',
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 25 },
              shadowOpacity: 0.25,
              shadowRadius: 50,
              elevation: 12,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {/* Image thumbnail */}
              <View style={{ width: 96, height: 96 }}>
                <View
                  style={{
                    width: 96,
                    height: 96,
                    backgroundColor: '#F1F5F9',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  {previewListing.images?.[0]?.storagePath ? (
                    <Image
                      source={{ uri: previewListing.images[0].storagePath }}
                      style={{ width: 96, height: 96 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ flex: 1, backgroundColor: colors.graphite300, opacity: 0.3 }} />
                  )}
                </View>
                {/* Heart button overlay */}
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 28,
                    height: 28,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="heart" size={10} color="#F43F5E" />
                </View>
              </View>

              {/* Details */}
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                {/* Owner name */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.bold,
                      fontSize: rf(10),
                      lineHeight: rf(15),
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      color: colors.iceBlue,
                    }}
                  >
                    {owner?.fullName ?? 'Owner'}
                  </Text>
                  <Ionicons name="checkmark-circle" size={10} color={colors.iceBlue} />
                </View>

                {/* Listing name */}
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: fontFamilies.inter.bold,
                    fontSize: rf(16),
                    lineHeight: rf(20),
                    color: '#0F172A',
                  }}
                >
                  {gear?.name ?? 'Listing'}
                </Text>

                {/* Rating row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
                  <Ionicons name="star" size={13.5} color="#FACC15" />
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.bold,
                      fontSize: rf(12),
                      lineHeight: rf(16),
                      letterSpacing: 0.028,
                      color: '#1E293B',
                      marginLeft: 4,
                    }}
                  >
                    {owner?.ratingAverage?.toFixed(1) ?? '5.0'}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.regular,
                      fontSize: rf(12),
                      lineHeight: rf(16),
                      color: '#94A3B8',
                      marginLeft: 4,
                    }}
                  >
                    ({owner?.ratingCount ?? 0} reviews)
                  </Text>
                </View>

                {/* Price + View button */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.bold,
                      fontSize: rf(18),
                      lineHeight: rf(28),
                      letterSpacing: -0.019,
                      color: '#0F172A',
                    }}
                  >
                    ${(previewListing.dailyPrice / 100).toFixed(0)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onListingPress(previewListing.id)}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      backgroundColor: '#0F172A',
                      borderRadius: 12,
                      shadowColor: '#E2E8F0',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3,
                      shadowRadius: 15,
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamilies.inter.bold,
                        fontSize: rf(14),
                        lineHeight: rf(20),
                        letterSpacing: 0.012,
                        color: colors.white,
                      }}
                    >
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────
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
