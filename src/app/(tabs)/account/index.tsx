import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  RefreshControl,
  Text,
  Image,
  Share,
  Animated,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { AlpineDialog } from '../../../components/ui/AlpineDialog';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ProfileHero } from '../../../components/ui/ProfileHero';
import { Avatar } from '../../../components/ui/Avatar';
import { AlpinePressable } from '../../../components/ui/AlpinePressable';
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuTrigger,
  type OptionsMenuTriggerHandle,
} from '../../../components/ui/OptionsMenu';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useProfile } from '../../../hooks/useProfile';
import { useUserRentals } from '../../../hooks/useRentals';
import { useOwnerListings, useSavedListings } from '../../../hooks/useListings';
import { usePaymentMethods } from '../../../hooks/usePayments';
import { useToast } from '../../../providers/ToastProvider';
import { spacing, radius } from '../../../theme/spacing';
import { fontFamilies, typeScale } from '../../../theme/typography';
import { rf } from '../../../theme/responsiveFont';
import { usePrefersReducedMotion } from '../../../theme/motion';
import { useTheme } from '../../../theme/ThemeContext';
import { ROUTES } from '../../../constants/routes';
import { getAnalyticsService } from '../../../services/analytics';
import { formatMoney } from '../../../utils/money';
import { getProfileTrustBadges } from '../../../utils/profile';
import type { VerificationStatus } from '../../../types/profile';

// ── Verification status → explicit, actionable trust language ────────────
const VERIFICATION_LABELS: Record<
  VerificationStatus,
  { label: string; variant: 'success' | 'pending' | 'neutral' | 'error'; note: string }
> = {
  verified: {
    label: 'Identity verified',
    variant: 'success',
    note: 'Your identity and contact details are confirmed. Higher-value rentals are unlocked.',
  },
  pending: {
    label: 'Verification pending',
    variant: 'pending',
    note: 'We are reviewing your identity documents. This usually takes less than a day.',
  },
  unverified: {
    label: 'Not verified',
    variant: 'neutral',
    note: 'Verify your identity to rent higher-value gear and reduce deposit requirements.',
  },
  suspended: {
    label: 'Account suspended',
    variant: 'error',
    note: 'Your account is suspended. Contact support to resolve this.',
  },
};

// Statuses that hold a security deposit.
const DEPOSIT_HOLDING_STATUSES = ['confirmed', 'pickup_due', 'active', 'return_due'];
// Statuses that count toward hosting earnings.
const EARNING_STATUSES = ['confirmed', 'active', 'completed'];

// Profile cover — Alpine landscape placeholder until real cover uploads exist.
// Same Unsplash URL style as the listing photos in mocks/data.ts.
const COVER_IMAGE_URL =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=500&fit=crop&auto=format';

// ── Collapsible-header geometry (keep in sync with the hero layout) ──────
// The cover, avatar overlap, and avatar size below are used both in the hero
// markup and the morph math, so they can't drift apart.
const COVER_HEIGHT = 136;
const HERO_AVATAR_OVERLAP = 52;
const HERO_AVATAR_SIZE = 96;
const HEADER_ROW_HEIGHT = 56;
const COLLAPSED_AVATAR_SIZE = 40;
// scrollY at which the header avatar copy has fully shrunk into the corner.
const TRAVEL_END = 150;
// Restrained ease-out curve for the travel: the picture advances quickly at
// first and decelerates as it settles into the corner — no overshoot.
const TRAVEL_EASE_STOPS = [0, 0.2, 0.4, 0.6, 0.8, 1] as const;
const travelEase = (f: number) => 1 - (1 - f) * (1 - f);
// Resting position of the hero avatar's top-left inside the scroll content
// (cover + content gap − overlap). Used only as a pre-measure fallback —
// the real position is measured at runtime via avatarRef.measureInWindow.
const HERO_AVATAR_TOP = COVER_HEIGHT + spacing.lg - HERO_AVATAR_OVERLAP;

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
  testID?: string;
}

/** A single menu row inside a grouped section card. */
function MenuRow({ icon, title, subtitle, onPress, destructive = false, testID }: MenuRowProps) {
  const { colors } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 56,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.input,
          backgroundColor: destructive ? colors.errorBackground : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? colors.error : colors.textPrimary}
        />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <AppText variant="titleSmall" color={destructive ? 'textPrimary' : 'textPrimary'}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        )}
      </View>
      <Ionicons
        name={destructive ? 'log-out-outline' : 'chevron-forward'}
        size={16}
        color={destructive ? colors.error : colors.textTertiary}
      />
    </View>
  );

  if (!onPress) {
    return <View testID={testID}>{content}</View>;
  }

  return (
    <AlpinePressable
      onPress={onPress}
      pressedStyle={{ backgroundColor: colors.surface }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </AlpinePressable>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={[typeScale.subtitle, { color: colors.textSecondary }]}>{children}</Text>
  );
}

/** Tight divider used between rows inside a grouped card. */
function RowDivider() {
  return <Divider marginVertical={0} />;
}

export default function AccountScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = usePrefersReducedMotion();
  const { width: screenWidth } = useWindowDimensions();
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuthContext();
  const userId = isAuthenticated ? (user?.id ?? '') : '';

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfile(userId);
  const {
    data: rentals,
    isLoading: rentalsLoading,
    refetch: refetchRentals,
    isFetching: rentalsFetching,
  } = useUserRentals(userId);
  const {
    data: listings,
    refetch: refetchListings,
    isFetching: listingsFetching,
  } = useOwnerListings(userId);
  const {
    data: savedListings,
    refetch: refetchSaved,
    isFetching: savedFetching,
  } = useSavedListings(userId);
  const {
    data: paymentMethods,
    refetch: refetchPayments,
  } = usePaymentMethods(isAuthenticated);

  // Sign-out confirmation — interrupts the session, so it asks first.
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  // Profile options (Edit / Share) — anchored under the 3-dot trigger.
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [optionsAnchorTop, setOptionsAnchorTop] = useState(96);
  const optionsTriggerRef = useRef<OptionsMenuTriggerHandle>(null);

  // ── Collapsible header — scroll-driven, same pattern as the gear-detail page ──
  // The value is JS-driven (setValue on scroll) so every derived opacity AND
  // transform updates reliably on all platforms and devices.
  const scrollY = useRef(new Animated.Value(0)).current;

  // The morph copy must rest EXACTLY over the in-content avatar. Its origin is
  // measured RELATIVE to the scroll-area wrapper (a frame this screen owns), so
  // it shares the morph's coordinate space — window/status-bar offsets and
  // navigator chrome can never skew it.
  const avatarRef = useRef<View>(null);
  const scrollAreaRef = useRef<View>(null);
  const [avatarBox, setAvatarBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  // Once the page scrolls, the in-content avatar hides and its header-layer
  // copy takes over — so only ONE image is ever visible.
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  const measureAvatar = useCallback(() => {
    const node = avatarRef.current;
    const area = scrollAreaRef.current;
    if (!node || !area) return;
    node.measureLayout(
      area,
      (x, y, w, h) => {
        if (w > 0 && h > 0) {
          setAvatarBox((prev) =>
            prev && prev.x === x && prev.y === y && prev.w === w && prev.h === h
              ? prev
              : { x, y, w, h },
          );
        }
      },
      () => {
        // Layout not ready yet — retry shortly.
        setTimeout(measureAvatar, 120);
      },
    );
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      scrollY.setValue(y);
      // Refresh the origin whenever the user is back at the top.
      if (y < 2) measureAvatar();
      const isScrolled = y > 4;
      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }
    },
    [scrollY, measureAvatar],
  );

  useEffect(() => {
    if (authLoading || profileLoading || rentalsLoading || !profile) return;
    measureAvatar();
    // Re-measure once layout settles and on rotation.
    const t = setTimeout(measureAvatar, 250);
    return () => clearTimeout(t);
  }, [measureAvatar, authLoading, profileLoading, rentalsLoading, profile, screenWidth]);

  // White surface fades in as the hero scrolls under it (no hairline — the
  // surface blends into the white page, so no border is ever drawn).
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // Collapsed name appears beside the shrunk avatar (after the in-content
  // name has faded, so the two never read as a duplicate).
  const headerNameOpacity = scrollY.interpolate({
    inputRange: [120, TRAVEL_END],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const headerNameTranslateY = scrollY.interpolate({
    inputRange: [120, TRAVEL_END],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });
  // The in-content name fades as the header name appears.
  const nameOpacity = scrollY.interpolate({
    inputRange: [80, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  // Header-copy origin — the in-content avatar's measured box (or the layout
  // guess while the measurement is pending; the copy isn't rendered until the
  // box is measured). The copy starts there, then travels to the corner.
  const origin = avatarBox ?? {
    x: screenWidth / 2 - HERO_AVATAR_SIZE / 2,
    y: HERO_AVATAR_TOP,
    w: HERO_AVATAR_SIZE,
    h: HERO_AVATAR_SIZE,
  };
  const originCx = origin.x + origin.w / 2;
  const originCy = origin.y + origin.h / 2;

  // ONE image does the animation: once the page scrolls, the in-content
  // avatar hides and its copy (in the header layer, above the white surface)
  // takes over from the exact same spot — then gently shrinks and slides
  // into the top-left corner by TRAVEL_END, easing out as it arrives.
  const travelInput = TRAVEL_EASE_STOPS.map((f) => f * TRAVEL_END);
  const headerAvatarScale = scrollY.interpolate({
    inputRange: travelInput,
    outputRange: TRAVEL_EASE_STOPS.map(
      (f) => 1 + (COLLAPSED_AVATAR_SIZE / HERO_AVATAR_SIZE - 1) * travelEase(f),
    ),
    extrapolate: 'clamp',
  });
  const headerAvatarTranslateX = scrollY.interpolate({
    inputRange: travelInput,
    outputRange: TRAVEL_EASE_STOPS.map(
      (f) => (spacing.lg + COLLAPSED_AVATAR_SIZE / 2 - originCx) * travelEase(f),
    ),
    extrapolate: 'clamp',
  });
  const headerAvatarTranslateY = scrollY.interpolate({
    inputRange: travelInput,
    outputRange: TRAVEL_EASE_STOPS.map(
      (f) => (insets.top + HEADER_ROW_HEIGHT / 2 - originCy) * travelEase(f),
    ),
    extrapolate: 'clamp',
  });

  useEffect(() => {
    getAnalyticsService().trackEvent({ name: 'profile_viewed' });
  }, []);

  const verification = useMemo(() => {
    const status: VerificationStatus = profile?.verificationStatus ?? 'unverified';
    return VERIFICATION_LABELS[status];
  }, [profile?.verificationStatus]);

  // Trust badges derived from real profile data.
  const trustBadges = useMemo(() => (profile ? getProfileTrustBadges(profile) : []), [profile]);

  // Hosting earnings: net (charge − fees) on owner rentals that reached a
  // payable state.
  const earningsMinor = useMemo(
    () =>
      (rentals ?? [])
        .filter(
          (r) => r.ownerId === userId && EARNING_STATUSES.includes(r.status),
        )
        .reduce((sum, r) => sum + (r.rentalCharge - r.fees), 0),
    [rentals, userId],
  );

  // Security deposit: held on the user's active/upcoming rentals.
  const depositHoldMinor = useMemo(
    () =>
      (rentals ?? [])
        .filter((r) => r.renterId === userId && DEPOSIT_HOLDING_STATUSES.includes(r.status))
        .reduce((sum, r) => sum + r.depositHold, 0),
    [rentals, userId],
  );
  const depositHoldCount = useMemo(
    () =>
      (rentals ?? []).filter(
        (r) => r.renterId === userId && DEPOSIT_HOLDING_STATUSES.includes(r.status),
      ).length,
    [rentals, userId],
  );

  const handleSignOutPress = () => setShowSignOutDialog(true);

  const handleOpenOptions = useCallback(() => {
    setOptionsAnchorTop(optionsTriggerRef.current?.getAnchorTop() ?? 96);
    setShowOptionsMenu(true);
  }, []);

  const confirmSignOut = async () => {
    setShowSignOutDialog(false);
    const result = await signOut();
    if (result?.error) {
      showToast('Could not sign out. Please try again.', 'error');
      return;
    }
    router.replace(ROUTES.TABS.DISCOVER);
  };

  const handlePlaceholder = (label: string) => {
    showToast(`${label} is coming in the full release`, 'info');
  };

  // Share Profile — opens the native share sheet with a link-style message.
  const handleShareProfile = useCallback(async () => {
    const name = profile?.fullName ?? 'this member';
    const location = profile?.location ? ` in ${profile.location}` : '';
    try {
      await Share.share({
        message: `Check out ${name}${location} on GearShare — rent and lend outdoor gear.`,
      });
      getAnalyticsService().trackEvent({ name: 'profile_shared', params: { userId } });
    } catch {
      showToast('Could not open the share sheet', 'error');
    }
  }, [profile, userId, showToast]);

  const isRefreshing = rentalsFetching || listingsFetching || savedFetching;
  const onRefresh = () => {
    refetchProfile();
    refetchRentals();
    refetchListings();
    refetchSaved();
    refetchPayments();
  };

  if (authLoading || profileLoading || rentalsLoading) {
    return (
      <Screen>
        <LoadingState message="Loading profile..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <Text style={[typeScale.h1, { color: colors.textPrimary }]}>Account</Text>
          <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: spacing.sm }}>
            Sign in to manage your account, rentals, and listings.
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

  if (profileError) {
    return (
      <Screen>
        <ErrorState onRetry={() => refetchProfile()} />
      </Screen>
    );
  }

  const defaultCard = paymentMethods?.find((m) => m.isDefault) ?? paymentMethods?.[0];
  const listingCount = listings?.length ?? 0;
  const savedCount = savedListings?.length ?? 0;
  const rentalCount = rentals?.length ?? 0;

  return (
    // `safeArea={false}` lets the cover run behind the status bar — the
    // options trigger still positions itself below the inset via `insets`.
    <Screen padded={false} safeArea={false}>
      {/* Options — replaces the notification bell; Edit / Share menu */}
      <View
        style={{ position: 'absolute', top: insets.top + spacing.sm, right: spacing.lg, zIndex: 20 }}
      >
        <OptionsMenuTrigger
          ref={optionsTriggerRef}
          onPress={handleOpenOptions}
          accessibilityLabel="Profile options"
          testID="profile-options-trigger"
        />
      </View>

      {/* Horizontal padding lives on the content so the cover can bleed
          full-width via its negative margin (a padded Screen would clip it).
          The wrapper gives the morph measurement a stable coordinate frame. */}
      <View ref={scrollAreaRef} style={{ flex: 1 }}>
      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.xxxxl,
          gap: spacing.lg,
          paddingHorizontal: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.graphite500}
            colors={[colors.signalLime]}
          />
        }
      >
        {/* ── Cover — background image replaces the old title header ── */}
        <View
          style={{
            height: COVER_HEIGHT,
            marginHorizontal: -spacing.lg,
            backgroundColor: colors.surface,
          }}
        >
          <Image
            source={{ uri: COVER_IMAGE_URL }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel="Profile cover photo"
          />
        </View>

        {/* ══ 1. HERO — common centered profile header ══════════════════ */}
        <ProfileHero
          testID="profile-hero"
          name={profile?.fullName ?? user?.user_metadata?.full_name ?? 'User'}
          avatarUrl={profile?.avatarUrl ?? null}
          verified={profile?.verificationStatus === 'verified'}
          location={profile?.location ?? null}
          bio={profile?.bio ?? null}
          trustBadges={trustBadges}
          rating={
            profile?.ratingAverage != null
              ? { average: profile.ratingAverage, count: profile.ratingCount }
              : null
          }
          listingCount={listingCount}
          coverOverlap={HERO_AVATAR_OVERLAP}
          avatarHidden={scrolled}
          nameFadeOpacity={nameOpacity}
          avatarRef={avatarRef}
        />

        {/* ══ 2. HOSTING & RENTING — both sides of the marketplace ════ */}
        <SectionTitle>Hosting & Renting</SectionTitle>
        <Card padded={false} testID="profile-marketplace-card">
          <MenuRow
            icon="briefcase-outline"
            title="My Gear Listings"
            subtitle={`${listingCount} active listing${listingCount !== 1 ? 's' : ''}`}
            onPress={() => router.push(ROUTES.OWNER.INDEX)}
            testID="manage-listings-row"
          />
          <RowDivider />
          <MenuRow
            icon="add-circle-outline"
            title="List New Gear"
            subtitle="Create a listing for your equipment"
            onPress={() => router.push(ROUTES.OWNER.NEW_LISTING)}
            testID="list-new-gear-row"
          />
          <RowDivider />
          <MenuRow
            icon="wallet-outline"
            title="Earnings & Payouts"
            subtitle={`${formatMoney(earningsMinor)} earned to date`}
            onPress={() => router.push(ROUTES.OWNER.INDEX)}
          />
          <RowDivider />
          <MenuRow
            icon="heart-outline"
            title="Saved Gear"
            subtitle={`${savedCount} saved item${savedCount !== 1 ? 's' : ''}`}
            onPress={() => handlePlaceholder('Saved gear')}
          />
          <RowDivider />
          <MenuRow
            icon="receipt-outline"
            title="Rental History & Receipts"
            subtitle={`${rentalCount} rental${rentalCount !== 1 ? 's' : ''} on file`}
            onPress={() => router.push(ROUTES.TABS.RENTALS)}
          />
        </Card>

        {/* ══ 4. TRUST & SAFETY ═══════════════════════════════════════ */}
        <SectionTitle>Verification & Trust</SectionTitle>
        <Card padded={false}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              minHeight: 56,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.input,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="id-card-outline" size={18} color={colors.textPrimary} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <AppText variant="titleSmall">Government ID</AppText>
              <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
                {verification.note}
              </AppText>
            </View>
            <StatusBadge label={verification.label} variant={verification.variant} />
          </View>
          <RowDivider />
          <MenuRow
            icon="card-outline"
            title="Payment & Deposit Cards"
            subtitle={
              defaultCard
                ? `${defaultCard.type === 'wallet' ? 'Wallet' : 'Card'} •••• ${defaultCard.lastFour}${
                    defaultCard.isDefault ? ' · Default' : ''
                  }`
                : 'No payment method on file yet'
            }
            onPress={() => handlePlaceholder('Payment settings')}
          />
          <RowDivider />
          <MenuRow
            icon="shield-checkmark-outline"
            title="Security Deposit"
            subtitle={
              depositHoldMinor > 0
                ? `${formatMoney(depositHoldMinor)} held across ${depositHoldCount} rental${
                    depositHoldCount !== 1 ? 's' : ''
                  }`
                : 'No deposits currently held'
            }
            onPress={() => handlePlaceholder('Deposit details')}
          />
          <RowDivider />
          <MenuRow
            icon="shield-outline"
            title="Damage Protection Plan"
            subtitle="Insurance coverage included with every rental"
            onPress={() => handlePlaceholder('Damage protection')}
          />
        </Card>

        {/* ══ 5. ACCOUNT & PREFERENCES ═════════════════════════════════ */}
        <SectionTitle>Account & Preferences</SectionTitle>
        <Card padded={false}>
          <MenuRow
            icon="person-outline"
            title="Personal Info"
            subtitle={user?.email ?? 'Update your details'}
            onPress={() => handlePlaceholder('Personal info')}
          />
          <RowDivider />
          <MenuRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Push, email, and rental updates"
            onPress={() => handlePlaceholder('Notification settings')}
          />
          <RowDivider />
          <MenuRow
            icon="settings-outline"
            title="App Settings"
            subtitle="Language, currency, and appearance"
            onPress={() => handlePlaceholder('App settings')}
          />
        </Card>

        {/* ══ 6. SUPPORT & FOOTER ═════════════════════════════════════ */}
        <SectionTitle>Support</SectionTitle>
        <Card padded={false}>
          <MenuRow
            icon="help-circle-outline"
            title="Help Center & Support"
            subtitle="FAQs, contact, and safety resources"
            onPress={() => handlePlaceholder('Help center')}
          />
          <RowDivider />
          <MenuRow
            icon="document-text-outline"
            title="Terms & Privacy"
            subtitle="Terms of Service and Privacy Policy"
            onPress={() => handlePlaceholder('Terms and privacy')}
          />
          <RowDivider />
          <MenuRow
            icon="log-out-outline"
            title="Log Out"
            subtitle="Sign out of this device"
            onPress={handleSignOutPress}
            destructive
            testID="sign-out-row"
          />
        </Card>
      </Animated.ScrollView>
      </View>

      {/* ── Collapsed header — white surface behind the shrunk avatar + name.
          Rendered AFTER the scroll view so it always paints above it; the
          avatar/name live inside the same container as the white surface,
          so the background can never fail to cover them. ───────────── */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + HEADER_ROW_HEIGHT,
          zIndex: 10,
        }}
      >
        {/* White surface */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.white,
            opacity: headerBgOpacity,
          }}
        />
        {/* Collapsed name + verified tick */}
        <Animated.View
          style={{
            position: 'absolute',
            left: spacing.lg + COLLAPSED_AVATAR_SIZE + spacing.md,
            right: 56,
            top: insets.top,
            height: HEADER_ROW_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            opacity: headerNameOpacity,
            transform: [{ translateY: headerNameTranslateY }],
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontFamily: fontFamilies.spaceGrotesk.bold,
              fontSize: rf(16),
              lineHeight: rf(22),
              color: colors.textPrimary,
            }}
          >
            {profile?.fullName ?? user?.user_metadata?.full_name ?? 'User'}
          </Text>
          {profile?.verificationStatus === 'verified' && (
            <Ionicons name="checkmark-circle" size={16} color={colors.verified} />
          )}
        </Animated.View>

        {/* The ONE avatar that does the animation — rendered in the header
            layer (above the white) only once the page has scrolled and the
            origin is measured. It takes over from the in-content avatar's
            exact spot, then shrinks and slides into the corner. */}
        {scrolled && avatarBox && !reducedMotion && (
          <Animated.View
            accessibilityElementsHidden
            style={{
              position: 'absolute',
              left: origin.x,
              top: origin.y,
              transform: [
                { translateX: headerAvatarTranslateX },
                { translateY: headerAvatarTranslateY },
                { scale: headerAvatarScale },
              ],
            }}
          >
            {profile?.verificationStatus === 'verified' ? (
              <View
                style={{
                  borderRadius: 9999,
                  borderWidth: 3,
                  borderColor: colors.verified,
                  padding: 3,
                  backgroundColor: colors.white,
                }}
              >
                <Avatar
                  uri={profile?.avatarUrl ?? null}
                  name={profile?.fullName ?? user?.user_metadata?.full_name ?? 'User'}
                  size={HERO_AVATAR_SIZE}
                />
              </View>
            ) : (
              <Avatar
                uri={profile?.avatarUrl ?? null}
                name={profile?.fullName ?? user?.user_metadata?.full_name ?? 'User'}
                size={HERO_AVATAR_SIZE}
              />
            )}
          </Animated.View>
        )}

        {/* Reduced motion: no travel — a static small avatar fades in at the
            corner while the in-content one fades out (crossfade only). */}
        {scrolled && reducedMotion && (
          <Animated.View
            accessibilityElementsHidden
            style={{
              position: 'absolute',
              left: spacing.lg,
              top: insets.top + (HEADER_ROW_HEIGHT - COLLAPSED_AVATAR_SIZE) / 2,
              opacity: headerBgOpacity,
            }}
          >
            {profile?.verificationStatus === 'verified' ? (
              <View
                style={{
                  borderRadius: 9999,
                  borderWidth: 3,
                  borderColor: colors.verified,
                  padding: 3,
                  backgroundColor: colors.white,
                }}
              >
                <Avatar
                  uri={profile?.avatarUrl ?? null}
                  name={profile?.fullName ?? user?.user_metadata?.full_name ?? 'User'}
                  size={COLLAPSED_AVATAR_SIZE}
                />
              </View>
            ) : (
              <Avatar
                uri={profile?.avatarUrl ?? null}
                name={profile?.fullName ?? user?.user_metadata?.full_name ?? 'User'}
                size={COLLAPSED_AVATAR_SIZE}
              />
            )}
          </Animated.View>
        )}
      </Animated.View>

      {/* ── Profile options — Edit / Share, text-only rows ──────────── */}
      <OptionsMenu
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        anchorTop={optionsAnchorTop}
        testID="profile-options-menu"
      >
        <OptionsMenuItem
          label="Edit Profile"
          onPress={() => {
            setShowOptionsMenu(false);
            handlePlaceholder('Profile editing');
          }}
          testID="edit-profile-item"
        />
        <OptionsMenuItem
          label="Share Profile"
          onPress={() => {
            setShowOptionsMenu(false);
            handleShareProfile();
          }}
          testID="share-profile-item"
        />
      </OptionsMenu>

      {/* ── Sign-out confirmation — critical account action → ask first ── */}
      <AlpineDialog
        visible={showSignOutDialog}
        title="Log out of GearShare?"
        message="You will be signed out on this device. Your rentals, messages, and listings stay saved — sign back in anytime to continue."
        confirmLabel="Log Out"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutDialog(false)}
        testID="sign-out-dialog"
      />
    </Screen>
  );
}
