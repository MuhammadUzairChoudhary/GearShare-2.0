import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { NotificationButton } from '../../../components/ui/NotificationButton';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { AlpineDialog } from '../../../components/ui/AlpineDialog';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Divider } from '../../../components/ui/Divider';
import { Chip } from '../../../components/ui/Chip';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { AlpinePressable } from '../../../components/ui/AlpinePressable';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useProfile } from '../../../hooks/useProfile';
import { useUserRentals } from '../../../hooks/useRentals';
import { useOwnerListings, useSavedListings } from '../../../hooks/useListings';
import { usePaymentMethods } from '../../../hooks/usePayments';
import { useToast } from '../../../providers/ToastProvider';
import { spacing, radius } from '../../../theme/spacing';
import { typeScale } from '../../../theme/typography';
import { useTheme } from '../../../theme/ThemeContext';
import { ROUTES } from '../../../constants/routes';
import { getAnalyticsService } from '../../../services/analytics';
import { formatMoney } from '../../../utils/money';
import { getProfileTrustBadges } from '../../../utils/profile';
import type { VerificationStatus } from '../../../types/profile';

type AccountMode = 'hosting' | 'renting';

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

  // Mode default follows the profile once loaded (hosting for owners).
  const [mode, setMode] = useState<AccountMode>('hosting');
  const [modeInitialized, setModeInitialized] = useState(false);
  // Sign-out confirmation — interrupts the session, so it asks first.
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    getAnalyticsService().trackEvent({ name: 'profile_viewed' });
  }, []);

  useEffect(() => {
    if (!modeInitialized && profile) {
      setMode(profile.isOwner ? 'hosting' : 'renting');
      setModeInitialized(true);
    }
  }, [profile, modeInitialized]);

  const verification = useMemo(() => {
    const status: VerificationStatus = profile?.verificationStatus ?? 'unverified';
    return VERIFICATION_LABELS[status];
  }, [profile?.verificationStatus]);

  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return '';
    return new Date(profile.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [profile?.createdAt]);

  const username = useMemo(
    () =>
      (profile?.fullName ?? 'user')
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, ''),
    [profile?.fullName],
  );

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

  const isRefreshing = rentalsFetching || listingsFetching || savedFetching;
  const onRefresh = () => {
    refetchProfile();
    refetchRentals();
    refetchListings();
    refetchSaved();
    refetchPayments();
  };

  const switchMode = (next: AccountMode) => {
    setMode(next);
    getAnalyticsService().trackEvent({ name: 'profile_mode_toggled', params: { mode: next } });
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
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxxxl, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.graphite500}
            colors={[colors.signalLime]}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingTop: spacing.xxl,
          }}
        >
          <View style={{ gap: spacing.xs, flex: 1 }}>
            <Text style={[typeScale.h1, { color: colors.textPrimary }]}>Account</Text>
            <Text style={[typeScale.monoSmall, { color: colors.textSecondary }]}>
              {memberSince ? `Member since ${memberSince}` : 'Account'}
            </Text>
          </View>
          <NotificationButton />
        </View>

        {/* ══ 1. HERO — identity & trust ═══════════════════════════════ */}
        <Card testID="profile-hero-card">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <Avatar uri={profile?.avatarUrl ?? null} name={profile?.fullName ?? 'User'} size="xl" />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppText variant="titleMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {profile?.fullName ?? user?.user_metadata?.full_name ?? 'User'}
                </AppText>
                {profile?.verificationStatus === 'verified' && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.signalLime} />
                )}
              </View>
              <AppText variant="monoSmall" color="textSecondary" numberOfLines={1}>
                @{username}
              </AppText>
              {profile?.location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                  <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
                    {profile.location}
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {/* Rating summary */}
          {profile?.ratingAverage != null && (
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

          {/* Public profile preview */}
          <Divider marginVertical={spacing.lg} />
          <AlpinePressable
            onPress={() => router.push(ROUTES.PROFILE(userId))}
            pressedStyle={{ opacity: 0.7 }}
            accessibilityRole="link"
            accessibilityLabel="View public profile"
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
            >
              <Ionicons name="person-outline" size={16} color={colors.textPrimary} />
              <AppText variant="labelMedium">View Public Profile</AppText>
              <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
            </View>
          </AlpinePressable>
        </Card>

        {/* ══ 2. MODE TOGGLE ══════════════════════════════════════════ */}
        <Card padded={false} testID="profile-mode-toggle">
          <View style={{ flexDirection: 'row', padding: spacing.xs, gap: spacing.xs }}>
            {(['hosting', 'renting'] as const).map((m) => {
              const active = mode === m;
              return (
                <AlpinePressable
                  key={m}
                  onPress={() => switchMode(m)}
                  pressedScale={0.99}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 44,
                    borderRadius: radius.input,
                    backgroundColor: active ? colors.carbon950 : 'transparent',
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={m === 'hosting' ? 'Hosting mode' : 'Renting mode'}
                >
                  <Text
                    style={[
                      typeScale.label,
                      {
                        color: active ? colors.titanium50 : colors.textSecondary,
                      },
                    ]}
                  >
                    {m === 'hosting' ? 'Hosting' : 'Renting'}
                  </Text>
                </AlpinePressable>
              );
            })}
          </View>
        </Card>

        {/* ══ 3. MODE HUB ═════════════════════════════════════════════ */}
        {mode === 'hosting' ? (
          <>
            <SectionTitle>Hosting Hub</SectionTitle>
            <Card padded={false}>
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
            </Card>
          </>
        ) : (
          <>
            <SectionTitle>Renter Hub</SectionTitle>
            <Card padded={false}>
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
          </>
        )}

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
      </ScrollView>

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
