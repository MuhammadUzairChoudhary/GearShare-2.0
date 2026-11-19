import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput as RNTextInput,
  Image,
  type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon, type IconName } from '../../../components/ui/Icons';

import { useTheme } from '../../../theme/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { NotificationButton } from '../../../components/ui/NotificationButton';
import { ListingCardSkeleton } from '../../../components/ui/ListingCardSkeleton';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { useFeaturedListings } from '../../../hooks/useListings';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { useSearchStore } from '../../../stores/useSearchStore';
import { spacing, radius } from '../../../theme/spacing';
import { fontFamilies, typeScale } from '../../../theme/typography';
import { rf } from '../../../theme/responsiveFont';
import { ROUTES } from '../../../constants/routes';
import { getAnalyticsService } from '../../../services/analytics';
import { mockListings } from '../../../mocks/data';
import type { Listing } from '../../../types/listing';
import type { ActivityType } from '../../../types/search';

// Figma color reference for light mode
const figma = {
  textDark: '#1F2225',
  textLabel: 'rgba(44, 48, 52, 0.4)',
  textSecondary: 'rgba(44, 48, 52, 0.6)',
  textPlaceholder: '#9CA3AF',
  border: '#DDE1E3',
  surface: '#F8F9F9',
  white: '#FFFFFF',
  darkBg: '#171A1C',
  lime: '#C8FF3D',
  promoBg: '#4CC9F0',
  star: '#FBD21D',
  heartGray: '#797C7F',
  priceText: '#2C3034',
  dotRed: '#EF4444',
};

// Activity chips matching the Figma: Climbing, Camping, Skiing, Biking
const ACTIVITY_CHIPS: { type: ActivityType; label: string; icon: IconName }[] = [
  { type: 'climbing', label: 'Climbing', icon: 'climbing' },
  { type: 'camping', label: 'Camping', icon: 'camping' },
  { type: 'snow', label: 'Snow', icon: 'skiing' },
  { type: 'cycling', label: 'Biking', icon: 'biking' },
];

export default function DiscoverScreen() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated } = useAuthContext();
  const { query, setQuery, setCategory } = useSearchStore();
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  const { data: featured, isLoading, isError, refetch } = useFeaturedListings();

  // Use featured listings for the compact cards, fall back to mock data
  const displayListings = useMemo(() => {
    if (featured && featured.length > 0) return featured;
    return mockListings.filter(
      (l) => l.publishedStatus === 'published' && l.availabilityStatus === 'available',
    );
  }, [featured]);

  useEffect(() => {
    getAnalyticsService().trackEvent({ name: 'discover_viewed' });
  }, []);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      getAnalyticsService().trackEvent({
        name: 'search_submitted',
        params: { query: query.trim(), category: selectedActivity ?? undefined },
      });
      router.push({
        pathname: '/search',
        params: { query: query.trim(), activity: selectedActivity ?? undefined },
      });
    }
  }, [query, selectedActivity]);

  const handleActivityPress = useCallback(
    (activity: ActivityType) => {
      const newActivity = selectedActivity === activity ? null : activity;
      setSelectedActivity(newActivity);
      if (newActivity) {
        setCategory(newActivity);
        router.push({
          pathname: '/search',
          params: { category: newActivity },
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

  const handleListGear = useCallback(() => {
    if (isAuthenticated) {
      router.push('/owner/listing/new');
    } else {
      router.push(ROUTES.AUTH.SIGN_IN);
    }
  }, [isAuthenticated]);

  // ======= Mode-aware colors =======
  const bg = isDark ? colors.background : figma.white;
  const textColor = isDark ? colors.textPrimary : figma.textDark;
  const secondaryText = isDark ? colors.textSecondary : figma.textSecondary;
  const borderColor = isDark ? colors.border : figma.border;
  const placeholderColor = isDark ? colors.textTertiary : figma.textPlaceholder;
  const cardBg = isDark ? colors.surface : figma.surface;
  const heartColor = isDark ? colors.graphite500 : figma.heartGray;
  const promoBgColor = isDark ? colors.information : figma.promoBg;

  // ======= Compact Listing Card Renderer =======
  const renderCompactCard = useCallback(
    (listing: Listing, index: number) => {
      const item = listing.gearItem;
      const owner = listing.owner;
      const rating = owner?.ratingAverage ?? 0;
      const distance = `${(1.2 + index * 0.5).toFixed(1)} km away`;
      const dailyPriceMinor = listing.dailyPrice;
      const depositMinor = listing.depositAmount;
      return (
        <TouchableOpacity
          key={listing.id}
          onPress={() => handleListingPress(listing.id)}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: spacing.lg, // 16px for breathing room
            gap: 16,
            width: '100%',
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: 10,
          } as ViewStyle}
          accessibilityRole="button"
          accessibilityLabel={`${item?.name ?? 'Listing'}, ${(dailyPriceMinor / 100).toFixed(2)} per day`}
        >
          {/* Gear image (100×100) */}
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: borderColor,
              borderRadius: radius.card,
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {listing.images?.[0]?.storagePath ? (
              <Image
                source={{ uri: listing.images[0].storagePath }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="image-outline" size={32} color={isDark ? colors.graphite500 : '#AEB4B7'} />
            )}
          </View>

          {/* Content area */}
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            {/* ── Row 1: Title + small chevron ── */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fontFamilies.spaceGrotesk.bold,
                  fontSize: rf(14),
                  lineHeight: rf(18),
                  color: textColor,
                }}
                numberOfLines={2}
              >
                {item?.name ?? 'Unknown Item'}
              </Text>
              {/* Small gray chevron (Figma: 18×18, #797C7F) */}
              <View
                style={{
                  width: 18,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 3, // Figma centering
                }}
              >
                <Ionicons name="chevron-forward" size={12} color={heartColor} />
              </View>
            </View>

            {/* ── Row 2: Rating + Distance (inline, no box) ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text
                style={{
                  fontFamily: fontFamilies.inter.bold,
                  fontSize: rf(10),
                  lineHeight: rf(15),
                  color: textColor,
                }}
              >
                <Text style={{ color: '#FACC15' }}>★</Text> {rating.toFixed(1)}
              </Text>
              <Text
                style={{
                  fontFamily: fontFamilies.inter.medium,
                  fontSize: rf(11),
                  lineHeight: rf(16),
                  color: secondaryText,
                }}
              >
                • {distance}
              </Text>
            </View>

            {/* ── Row 3: Price vertically stacked — rate prominent, deposit muted ── */}
            <View>
              {/* Daily rate — bold and prominent */}
              <Text
                style={{
                  fontFamily: fontFamilies.spaceGrotesk.bold,
                  fontSize: rf(16),
                  lineHeight: rf(22),
                  color: textColor,
                }}
              >
                €{(dailyPriceMinor / 100).toFixed(2)}<Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(22), color: secondaryText }}> /day</Text>
              </Text>
              {/* Deposit — smaller, muted, below */}
              <Text
                style={{
                  fontFamily: fontFamilies.inter.regular,
                  fontSize: rf(10),
                  lineHeight: rf(14),
                  color: secondaryText,
                  marginTop: 0,
                }}
              >
                €{(depositMinor / 100).toFixed(2)} deposit
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [textColor, secondaryText, borderColor, cardBg, heartColor, isDark, colors, handleListingPress],
  );

  // ======= Promo Card =======
  const renderPromoCard = useCallback(() => {
    return (
      <View
        key="promo-card"
        style={{
          width: '100%',
          padding: 24,
          backgroundColor: promoBgColor,
          borderRadius: radius.card,
          overflow: 'hidden',
        }}
      >
        {/* Decorative icon in corner */}
        <View
          style={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: 120,
            height: 96,
            opacity: 0.2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="leaf-outline" size={80} color={colors.white} />
        </View>

        {/* Content */}
        <View style={{ gap: 0, zIndex: 1 }}>
          <Text
            style={{
              fontFamily: fontFamilies.spaceGrotesk.bold,
              fontSize: rf(18),
              lineHeight: rf(28),
              letterSpacing: -0.45,
              textTransform: 'uppercase',
              color: colors.white,
            }}
          >
            Earn from your gear
          </Text>
          <View style={{ height: 0 }} />
          <Text
            style={{
              fontFamily: fontFamilies.inter.regular,
              fontSize: rf(12),
              lineHeight: rf(16),
              color: '#ECEEEF',
              marginBottom: 12,
            }}
          >
            List your equipment and join the community.
          </Text>
          <TouchableOpacity
            onPress={handleListGear}
            style={{
              alignSelf: 'flex-start',
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: figma.lime,
              borderRadius: radius.card,
            }}
            accessibilityRole="button"
            accessibilityLabel="List your equipment"
          >
            <Text
              style={{
                fontFamily: fontFamilies.inter.bold,
                fontSize: rf(11),
                lineHeight: rf(16),
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: figma.darkBg,
              }}
            >
              List Equipment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [promoBgColor, colors, handleListGear]);

  // ======= Fixed Header (location + search — pinned, never scrolls) =======
  const FixedHeader = useMemo(
    () => (
      <View
        style={{
          paddingTop: spacing.xxl,
          paddingHorizontal: 20,
          // 4px here + the 12px top padding of the activity-chip strip = 16px,
          // matching the gap between search and filters in the Chat tab.
          paddingBottom: spacing.xs,
          gap: 20,
          backgroundColor: bg,
        }}
      >
          {/* Top row: Location + Notification */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Location button + text */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {}}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: borderColor,
                  backgroundColor: isDark ? colors.surface : figma.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="Select location"
              >
                <AppIcon name="location" size={16} color={textColor} />
              </TouchableOpacity>

              <View style={{ gap: 4 }}>
              <Text
                style={[typeScale.labelSmall, { color: secondaryText }]}
              >
                Location
              </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text
                    style={[typeScale.h4, { color: textColor }]}
                  >
                    Chamonix, FR
                  </Text>
                  <Ionicons name="chevron-down" size={10} color={textColor} />
                </View>
              </View>
            </View>

            {/* Notification bell */}
            <NotificationButton />
          </View>

          {/* Search bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.lg,
              height: 40,
              backgroundColor: isDark ? colors.surface : figma.white,
              borderWidth: 1,
              borderColor: borderColor,
              borderRadius: radius.card,
              gap: 12,
            }}
          >
            <Ionicons name="search-outline" size={14} color={placeholderColor} />
            <RNTextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              placeholder="Search equipment or activity"
              placeholderTextColor={placeholderColor}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                fontFamily: fontFamilies.inter.medium,
                fontSize: rf(14),
                lineHeight: rf(20),
                color: textColor,
                padding: 0,
                margin: 0,
              }}
              accessibilityLabel="Search equipment or activity"
              accessibilityRole="search"
            />
          </View>
      </View>
    ),
    [
      bg, textColor, secondaryText, borderColor, placeholderColor, isDark, colors,
      query, setQuery, handleSearch,
    ],
  );

  // ======= Scrolling content (activity chips + sections) =======
  const ScrollContent = useMemo(
    () => (
      <View>
        {/* ===== Activity Chips ===== */}
        <View
          style={{
            paddingVertical: 12,
            height: 56,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 8,
            }}
          >
            {ACTIVITY_CHIPS.map((chip) => {
              const isActive = selectedActivity === chip.type;
              return (
                <TouchableOpacity
                  key={chip.type}
                  onPress={() => handleActivityPress(chip.type)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    height: 32,
                    gap: 8,
                    backgroundColor: isActive ? figma.lime : (isDark ? colors.surface : figma.white),
                    borderWidth: 1,
                    borderColor: isActive ? figma.lime : borderColor,
                    borderRadius: 9999,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${chip.label} ${isActive ? 'selected' : ''}`}
                >
                  <AppIcon
                    name={chip.icon}
                    size={12}
                    color={isActive ? figma.darkBg : textColor}
                  />
                  <Text
                style={[typeScale.monoSmall, { color: isActive ? figma.darkBg : textColor }]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ===== Sections with compact cards ===== */}
        <View style={{ paddingHorizontal: 20, gap: 16, paddingBottom: spacing.xxl }}>
          {/* Section header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: fontFamilies.spaceGrotesk.bold,
                fontSize: rf(20),
                lineHeight: rf(28),
                letterSpacing: 0.003,
                color: textColor,
              }}
            >
              Recommended Nearby
            </Text>
            <TouchableOpacity
              onPress={() => {
                setCategory(null as any);
                router.push({ pathname: '/search', params: { activity: selectedActivity ?? undefined } });
              }}
              accessibilityRole="button"
              accessibilityLabel="See all listings"
            >
              <Text
                style={{
                  fontFamily: fontFamilies.inter.bold,
                  fontSize: rf(12),
                  lineHeight: rf(16),
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: secondaryText,
                }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cards */}
          {isLoading ? (
            <View style={{ gap: spacing.lg }}>
              {[1, 2, 3].map((i: number) => (
                <ListingCardSkeleton key={i} />
              ))}
            </View>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : displayListings.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="No listings yet"
              description="Check back soon for available equipment."
            />
          ) : (
            <View style={{ gap: 16 }}>
              {displayListings[0] && renderCompactCard(displayListings[0], 0)}
              {displayListings[1] && renderCompactCard(displayListings[1], 1)}
              {renderPromoCard()}
              {displayListings[2] && renderCompactCard(displayListings[2], 2)}
              {displayListings[3] && renderCompactCard(displayListings[3], 3)}
              {displayListings[4] && renderCompactCard(displayListings[4], 4)}
            </View>
          )}
        </View>
      </View>
    ),
    [
      textColor, secondaryText, borderColor, isDark, colors, selectedActivity,
      handleActivityPress, isLoading, isError, displayListings, refetch,
      renderCompactCard, renderPromoCard, setCategory,
    ],
  );

  return (
    <Screen safeArea padded={false} scrollable={false}>
      {FixedHeader}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {ScrollContent}
      </ScrollView>
    </Screen>
  );
}
