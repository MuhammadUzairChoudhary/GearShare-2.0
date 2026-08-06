import React, { useCallback, useRef, useState } from 'react';
import { View, Animated, TouchableOpacity, Text, StatusBar, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon } from '../../components/ui/Icons';
import { BackButton } from '../../components/ui/BackButton';
import { useTheme } from '../../theme/ThemeContext';
import { fontFamilies } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { rf } from '../../theme/responsiveFont';
import { useListing } from '../../hooks/useListings';
import { useAuthContext } from '../../features/auth/AuthProvider';
import type { PendingAuthIntent } from '../../types/auth-intent';
import { ROUTES } from '../../constants/routes';
import { getAnalyticsService } from '../../services/analytics';
import { formatMoney } from '../../utils/money';


export default function ListingDetailScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { colors } = useTheme();
  const { isAuthenticated, setPendingAction } = useAuthContext();
  const { data: listing, isLoading, isError, refetch } = useListing(listingId ?? '');
  const [isSaved, setIsSaved] = useState(false);

    const IMAGE_HEIGHT = Dimensions.get('window').height * 0.4;

  const scrollY = useRef(new Animated.Value(0)).current;

  // ── Animated interpolations for collapsible header ──────────────
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [IMAGE_HEIGHT * 0.3, IMAGE_HEIGHT * 0.95],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const collapsedTitleOpacity = scrollY.interpolate({
    inputRange: [IMAGE_HEIGHT * 0.75, IMAGE_HEIGHT * 0.95],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const mainTitleOpacity = scrollY.interpolate({
    inputRange: [IMAGE_HEIGHT * 0.75, IMAGE_HEIGHT * 0.95],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleRequestRental = useCallback(() => {
    if (!isAuthenticated) {
      const intent: PendingAuthIntent = {
        type: 'request-rental',
        listingId: listingId ?? '',
      };
      setPendingAction(intent);
      router.push(ROUTES.AUTH.SIGN_IN);
      return;
    }
    getAnalyticsService().trackEvent({
      name: 'rental_request_started',
      params: { listingId: listingId ?? '' },
    });
    router.push(`/rental/${listingId}?demo=true` as any);
  }, [isAuthenticated, listingId, setPendingAction]);

  const handleSaveListing = useCallback(() => {
    if (!isAuthenticated) {
      const intent: PendingAuthIntent = { type: 'save-listing', listingId: listingId ?? '' };
      setPendingAction(intent);
      router.push(ROUTES.AUTH.SIGN_IN);
      return;
    }
    setIsSaved(!isSaved);
    getAnalyticsService().trackEvent({
      name: 'listing_saved',
      params: { listingId: listingId ?? '' },
    });
  }, [isAuthenticated, listingId, setPendingAction, isSaved]);

  const handleShareListing = useCallback(() => {
    getAnalyticsService().trackEvent({
      name: 'listing_shared',
      params: { listingId: listingId ?? '' },
    });
  }, [listingId]);

  // ── Loading / Error states ──────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.graphite300, opacity: 0.3 }} />
          <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(14), color: colors.textSecondary }}>
            Loading listing...
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Listing',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
            headerLeft: () => <BackButton />,
          }}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={{ fontFamily: fontFamilies.inter.medium, fontSize: rf(16), color: colors.textPrimary }}>
            Could not load listing
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ paddingHorizontal: 24, height: 44, backgroundColor: colors.carbon950, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(14), color: colors.white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const gear = listing.gearItem;
  const owner = listing.owner;
  const estTotal = listing.dailyPrice * 3;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* ── Header background (animated) ───────────────────── */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9, height: 100, backgroundColor: colors.white, opacity: headerBgOpacity }}>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: '#DDE1E3' }} />
      </Animated.View>

      {/* ── Fixed header overlay (back, share, save, collapsed title) ── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 48, paddingBottom: 16 }}>
        {/* Back button — translucent over the photo, like the share/save actions */}
        <BackButton overContent />

        {/* Collapsed title (appears on scroll) — vertically centered with icons */}
        <Animated.View style={{ position: 'absolute', left: 76, right: 116, top: 48, bottom: 16, opacity: collapsedTitleOpacity, justifyContent: 'center', alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(16), lineHeight: rf(22), color: '#1F2225' }}>
            {gear?.name ?? 'Listing'}
          </Text>
        </Animated.View>

        {/* Share + Save */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={handleShareListing}
            style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel="Share listing"
          >
            <AppIcon name="share" size={14} color="#1F2225" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveListing}
            style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save listing'}
          >
            <AppIcon name={isSaved ? 'heart' : 'heart-outline'} size={16} color={isSaved ? '#EF4444' : '#1F2225'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable content (hero image + details) ──────────────── */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 112 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Hero Image — 2/5 of screen height ──────────────────── */}
        <View style={{ width: '100%', height: IMAGE_HEIGHT, backgroundColor: '#DDE1E3' }}>
          {/* Placeholder image */}
          <View style={{ flex: 1, backgroundColor: colors.graphite300, opacity: 0.3 }} />

          {/* Pagination dots */}
          <View style={{ position: 'absolute', bottom: 24, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(31,34,37,0.3)', borderRadius: 9999 }}>
            <View style={{ width: 6, height: 6, backgroundColor: '#C8FF3D', borderRadius: 9999 }} />
            <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 9999 }} />
            <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 9999 }} />
            <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 9999 }} />
          </View>
        </View>
        {/* ── Listing Info ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: 32, gap: 16 }}>
          {/* Category */}
          <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>
            {gear?.category?.replace('_', ' / ').replace(/\b\w/g, (l) => l.toUpperCase()) ?? ''}
          </Text>

          {/* Title (fades out as user scrolls past image) */}
          <Animated.Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(24), lineHeight: rf(32), letterSpacing: -0.6, color: '#1F2225', opacity: mainTitleOpacity }}>
            {gear?.name ?? 'Listing'}
          </Animated.Text>

          {/* Rating + ID badges */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Rating badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 4 }}>
              <Text style={{ fontSize: rf(11.25), color: '#FACC15', lineHeight: rf(12) }}>★</Text>
              <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: -0.009, color: '#1F2225' }}>
                {owner?.ratingAverage?.toFixed(1) ?? '5.0'} ({owner?.ratingCount ?? 0} reviews)
              </Text>
            </View>

            {/* ID badge */}
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#1F2225', borderRadius: 4 }}>
              <Text style={{ fontFamily: fontFamilies.ibmPlexMono.regular, fontSize: rf(9), lineHeight: rf(14), letterSpacing: 0.9, textTransform: 'uppercase', color: colors.white }}>
                ID: {listingId?.toUpperCase()?.slice(0, 8) ?? 'GS-000'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Pricing Card ─────────────────────────────────────────── */}
        <View style={{ marginHorizontal: spacing.xl, marginTop: 20, padding: spacing.xl, backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#DDE1E3', borderRadius: radius.card }}>
          {/* — Estimated Total Section — */}
          <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)', marginBottom: 8 }}>
            Estimated Total
          </Text>

          {/* Price row: €96.00  for 3 days */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4, flexShrink: 1 }}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(28), lineHeight: rf(34), letterSpacing: -0.5, color: '#1F2225' }}>
              {formatMoney(estTotal)}
            </Text>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: fontFamilies.inter.semiBold, fontSize: rf(14), lineHeight: rf(20), color: 'rgba(44,48,52,0.5)' }}>
              for 3 days
            </Text>
          </View>

          {/* Sub-text: (€32.00 / day) */}
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: fontFamilies.inter.regular, fontSize: rf(12), lineHeight: rf(16), letterSpacing: 0.2, color: 'rgba(44,48,52,0.4)', marginBottom: 20 }}>
            ({formatMoney(listing.dailyPrice)} / day)
          </Text>

          {/* — Divider — */}
          <View style={{ height: 1, backgroundColor: '#ECEEEF', marginBottom: 20 }} />

          {/* — Security Deposit Section — */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>
                Security Deposit
              </Text>
              <AppIcon name="info" size={10} color="rgba(44,48,52,0.4)" />
            </View>
            <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(16), lineHeight: rf(22), letterSpacing: 0.015, color: '#1F2225' }}>
              {formatMoney(listing.depositAmount)}
            </Text>
          </View>
        </View>

        {/* ── Technical Specifications ─────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16 }}>
          <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: 1.2, textTransform: 'uppercase', color: '#1F2225', paddingBottom: 8 }}>
            Technical Specifications
          </Text>
          <View style={{ padding: spacing.lg, backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#DDE1E3', borderRadius: radius.card }}>
            <SpecRow label1="Weight (Total)" value1="1.28 kg" label2="Size Range" value2="0.3 – 4.0" />
            <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />
            <SpecRow label1="Material" value1="Aircraft Aluminum" label2="Mfg Year" value2="2023" />
          </View>
        </View>

        {/* ── Gear Condition ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16 }}>
          <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: 1.2, textTransform: 'uppercase', color: '#1F2225', paddingBottom: 8 }}>
            Gear Condition
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, padding: spacing.lg, backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#DDE1E3', borderRadius: radius.card }}>
            {/* Icon box */}
            <View style={{ width: 48, height: 48, backgroundColor: 'rgba(200,255,61,0.4)', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
              <AppIcon name="flash" size={24} color="#1F2225" />
            </View>
            {/* Text */}
            <View style={{ flex: 1, gap: 4.5 }}>
              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(20), letterSpacing: 0.002, textTransform: 'uppercase', color: '#1F2225' }}>
                {gear?.condition?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ?? 'Good'}
              </Text>
              <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(12), lineHeight: rf(20), color: 'rgba(44,48,52,0.6)' }}>
                {gear?.description?.slice(0, 120) ?? 'Well-maintained equipment. Ready for your adventure.'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Gear Owner ───────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16 }}>
          <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: 1.2, textTransform: 'uppercase', color: '#1F2225', paddingBottom: 8 }}>
            Gear Owner
          </Text>
          <View style={{ padding: spacing.lg, backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#DDE1E3', borderRadius: radius.card }}>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <View style={{ width: 55.27, height: 56, position: 'relative' }}>
                <View style={{ width: 55.27, height: 56, backgroundColor: colors.graphite300, borderRadius: 9999 }} />
                {/* Verified badge */}
                <View style={{ position: 'absolute', right: -4, bottom: -4, width: 20, height: 20, backgroundColor: colors.signalLime, borderWidth: 2, borderColor: '#F8F9F9', borderRadius: 9999, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: rf(7), color: '#1F2225', fontWeight: '700' }}>✓</Text>
                </View>
              </View>

              {/* Info */}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(20), letterSpacing: 0.007, color: '#1F2225' }}>
                  {owner?.fullName ?? 'Owner'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 0.006, color: 'rgba(44,48,52,0.6)' }}>
                    {owner?.verificationStatus === 'verified' ? 'Verified Guide' : 'Member'}
                  </Text>
                  <View style={{ width: 3.94, height: 4, backgroundColor: '#CFD4D8', borderRadius: 9999 }} />
                  <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 0.005, color: 'rgba(44,48,52,0.6)' }}>
                    {owner?.ratingCount ?? 0} Rentals
                  </Text>
                </View>
                {/* Response time */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <AppIcon name="flash" size={8.75} color={colors.signalLime} />
                  <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(9), lineHeight: rf(14), letterSpacing: 0.007, textTransform: 'uppercase', color: '#1F2225' }}>
                    Responds in 5m
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Description ──────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 15 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: 1.2, textTransform: 'uppercase', color: '#1F2225' }}>
              Description
            </Text>
            <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />
          </View>
          <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(14), lineHeight: rf(23), color: '#1F2225' }}>
            {gear?.description ?? 'No description available.'}
          </Text>
          {gear?.description && (
            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(14), lineHeight: rf(23), color: '#1F2225', marginTop: 8 }}>
              Includes color-coded components for each piece. Perfect for your next adventure. These have been meticulously inspected after every use.
            </Text>
          )}
        </View>

        {/* ── Policies ─────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16, paddingBottom: 32 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: 1.2, textTransform: 'uppercase', color: '#1F2225' }}>
              Platform Policies
            </Text>
            <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />
          </View>
          <View style={{ gap: 16 }}>
            {/* Cancellation */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ paddingTop: 4 }}>                 <AppIcon name="calendar" size={14} color="#1F2225" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: -0.3, textTransform: 'uppercase', color: '#1F2225' }}>
                  Cancellation Policy
                </Text>
                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), letterSpacing: -0.002, color: 'rgba(44,48,52,0.6)' }}>
                  Full refund up to 48 hours before the start of the rental period. Cancellations after that may be subject to partial charges.
                </Text>
              </View>
            </View>

            {/* Damage */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ paddingTop: 4 }}>                 <AppIcon name="damage-protection" size={15.75} color="#1F2225" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: -0.3, textTransform: 'uppercase', color: '#1F2225' }}>
                  Damage Protection
                </Text>
                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.6)' }}>
                  Renters are responsible for replacement costs of lost or non-functional equipment.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ── Fixed Bottom Action Bar ────────────────────────────────── */}
      <View style={{ paddingHorizontal: spacing.xl, paddingVertical: 18, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#DDE1E3' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left: Total + price + deposit hint */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(9), lineHeight: rf(14), letterSpacing: 0.9, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>
              TOTAL (3 DAYS)
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(24), lineHeight: rf(32), letterSpacing: 0.001, color: '#1F2225' }}
            >
              {formatMoney(estTotal)}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(9), lineHeight: rf(14), color: 'rgba(44,48,52,0.4)' }}>
              ({formatMoney(listing.depositAmount)} deposit hold)
            </Text>
          </View>

          {/* Right: Request Rental button */}
          <TouchableOpacity
            onPress={handleRequestRental}
            activeOpacity={0.85}
            style={{
              paddingHorizontal: 24,
              height: 56,
              backgroundColor: colors.signalLime,
              borderWidth: 1,
              borderColor: colors.signalLime,
              borderRadius: radius.button,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: 'rgba(200,255,61,0.2)',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
              elevation: 6,
            }}
            accessibilityLabel="Rent Now"
          >
            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(12), lineHeight: rf(16), letterSpacing: 1.2, textTransform: 'uppercase', color: '#1F2225' }}>
              Rent Now
            </Text>
            <AppIcon name="chevron-right" size={6.25} color="#1F2225" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Component: 2-column spec row (no divider — handled by parent) ──
function SpecRow({
  label1, value1, label2, value2,}: {
  label1: string; value1: string; label2: string; value2: string;
}): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1, paddingVertical: 8 }}>
        <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>
          {label1}
        </Text>
        <View style={{ paddingTop: 4 }}>
          <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(20), color: '#1F2225' }}>
            {value1}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, paddingVertical: 8 }}>
        <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>
          {label2}
        </Text>
        <View style={{ paddingTop: 4 }}>
          <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(20), color: '#1F2225' }}>
            {value2}
          </Text>
        </View>
      </View>
    </View>
  );
}
