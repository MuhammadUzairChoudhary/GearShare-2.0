import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { IconButton } from '../../components/ui/IconButton';
import { MoneyText } from '../../components/ui/MoneyText';
import { Chip } from '../../components/ui/Chip';
import { Divider } from '../../components/ui/Divider';
import { Card } from '../../components/ui/Card';
import { AvailabilityBadge } from '../../components/ui/AvailabilityBadge';
import { ListingImageGallery } from '../../components/ui/ListingImageGallery';
import { OwnerSummaryCard } from '../../components/ui/OwnerSummaryCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useListing } from '../../hooks/useListings';
import { useAuthContext } from '../../features/auth/AuthProvider';
import type { PendingAuthIntent } from '../../types/auth-intent';
import { spacing, minTouchSize } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import { getAnalyticsService } from '../../services/analytics';
import { formatDailyPrice, formatMoney, calculateRentalDays } from '../../utils/money';
import { mockReviews } from '../../mocks/data';

export default function ListingDetailScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { colors } = useTheme();
  const { isAuthenticated, setPendingAction } = useAuthContext();
  const { data: listing, isLoading, isError, refetch } = useListing(listingId ?? '');
  const [isSaved, setIsSaved] = useState(false);

  const reviews = useMemo(() => mockReviews.filter((r) => r.listingId === listingId), [listingId]);

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

    router.push(`/rental/request/${listingId}` as any);
  }, [isAuthenticated, listingId, setPendingAction]);

  const handleMessageOwner = useCallback(() => {
    if (!isAuthenticated) {
      const intent: PendingAuthIntent = {
        type: 'message-owner',
        listingId: listingId ?? '',
        ownerId: listing?.ownerId ?? '',
      };
      setPendingAction(intent);
      router.push(ROUTES.AUTH.SIGN_IN);
      return;
    }
    router.push(ROUTES.TABS.INBOX);
  }, [isAuthenticated, listingId, listing?.ownerId, setPendingAction]);

  const handleSaveListing = useCallback(() => {
    if (!isAuthenticated) {
      const intent: PendingAuthIntent = {
        type: 'save-listing',
        listingId: listingId ?? '',
      };
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

  if (isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading listing..." />
      </Screen>
    );
  }

  if (isError || !listing) {
    return (
      <Screen>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Listing',
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
        <ErrorState onRetry={() => refetch()} />
      </Screen>
    );
  }

  const gearItem = listing.gearItem;
  const owner = listing.owner;
  const isAvailable = listing.availabilityStatus === 'available';

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: gearItem?.name ?? 'Listing',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerLeft: () => (
            <IconButton
              icon="arrow-back"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <IconButton
                icon={isSaved ? 'heart' : 'heart-outline'}
                onPress={handleSaveListing}
                accessibilityLabel={isSaved ? 'Remove from saved' : 'Save listing'}
                color={isSaved ? colors.error : colors.textPrimary}
              />
              <IconButton
                icon="share-outline"
                onPress={handleShareListing}
                accessibilityLabel="Share listing"
              />
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxxl }}>
        {/* Image gallery */}
        <ListingImageGallery
          images={listing.images ?? []}
          fallbackLabel={gearItem?.name ?? 'Equipment image'}
        />
        <View style={{ height: spacing.xxl }} />

        {/* Title & Price */}
        <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1, gap: spacing.xs }}>
              <AppText variant="displayMedium">{gearItem?.name ?? 'Equipment'}</AppText>
              {(gearItem?.brand || gearItem?.model) && (
                <AppText variant="bodyLarge" color="textSecondary">
                  {[gearItem?.brand, gearItem?.model].filter(Boolean).join(' ')}
                </AppText>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <AvailabilityBadge status={listing.availabilityStatus} />
            <Chip
              label={
                gearItem?.category?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ?? ''
              }
              variant="default"
            />
          </View>
        </View>

        {/* Pricing bar */}
        <Card style={{ marginBottom: spacing.xxl }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View>
              <MoneyText variant="dailyPrice" minorUnits={listing.dailyPrice} />
              <AppText variant="bodySmall" color="textTertiary">
                Min {listing.minRentalDuration} day{listing.minRentalDuration > 1 ? 's' : ''}
              </AppText>
            </View>
            <AppText variant="bodySmall" color="textTertiary">
              Deposit: {formatMoney(listing.depositAmount)}
            </AppText>
          </View>
        </Card>

        {/* Owner */}
        {owner && (
          <View style={{ marginBottom: spacing.xxl }}>
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Owner
            </AppText>
            <OwnerSummaryCard
              owner={owner}
              onPress={() => router.push(`/profile/${owner.id}` as any)}
            />
          </View>
        )}

        <Divider />

        {/* Description */}
        {gearItem?.description && (
          <View style={{ marginBottom: spacing.xxl }}>
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Description
            </AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              {gearItem.description}
            </AppText>
          </View>
        )}

        {/* Specifications */}
        {gearItem?.specifications && Object.keys(gearItem.specifications).length > 0 && (
          <View style={{ marginBottom: spacing.xxl }}>
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Specifications
            </AppText>
            <Card padded>
              <View style={{ gap: spacing.md }}>
                {Object.entries(gearItem.specifications).map(([key, value]) => (
                  <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <AppText variant="bodyMedium" color="textSecondary">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </AppText>
                    <AppText variant="bodyMedium">{value as string}</AppText>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Condition & Wear */}
        {gearItem?.condition && (
          <View style={{ marginBottom: spacing.xxl }}>
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Condition
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Chip
                label={gearItem.condition
                  .replace('_', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                variant="default"
              />
            </View>
          </View>
        )}

        {/* Included components */}
        {gearItem?.includedComponents && gearItem.includedComponents.length > 0 && (
          <View style={{ marginBottom: spacing.xxl }}>
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Includes
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {gearItem.includedComponents.map((component) => (
                <Chip key={component} label={component} variant="default" />
              ))}
            </View>
          </View>
        )}

        <Divider />

        {/* Pickup area */}
        {listing.pickupArea && (
          <View style={{ marginBottom: spacing.xxl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="location-outline" size={18} color={colors.graphite500} />
              <AppText variant="bodyMedium" color="textSecondary">
                Pickup: {listing.pickupArea}
              </AppText>
            </View>
          </View>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={{ marginBottom: spacing.xxl }}>
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Reviews ({reviews.length})
            </AppText>
            <View style={{ gap: spacing.md }}>
              {reviews.slice(0, 3).map((review) => (
                <Card key={review.id}>
                  <View style={{ gap: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Chip label={`${review.rating.overall}/5`} variant="active" />
                    </View>
                    {review.feedback && (
                      <AppText variant="bodyMedium" color="textSecondary">
                        {review.feedback}
                      </AppText>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Policies */}
        <Divider />
        {listing.policies && listing.policies.length > 0 && (
          <View style={{ marginBottom: spacing.xxl }}>
            <AppText variant="titleSmall" style={{ marginBottom: spacing.md }}>
              Policies
            </AppText>
            <Card padded>
              <View style={{ gap: spacing.md }}>
                {listing.policies.map((policy, index) => (
                  <View key={index} style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <AppText variant="bodyMedium" color="textTertiary">
                      •
                    </AppText>
                    <AppText variant="bodyMedium" color="textSecondary" style={{ flex: 1 }}>
                      {policy}
                    </AppText>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Action buttons */}
        <View style={{ gap: spacing.md }}>
          {isAvailable ? (
            <AppButton
              title="Request Rental"
              onPress={handleRequestRental}
              variant="primary"
              fullWidth
              size="lg"
            />
          ) : (
            <AppButton
              title={
                listing.availabilityStatus === 'unavailable'
                  ? 'Currently Unavailable'
                  : 'Already Booked'
              }
              onPress={() => {}}
              variant="secondary"
              fullWidth
              disabled
            />
          )}
          <AppButton title="Message Owner" onPress={handleMessageOwner} variant="ghost" fullWidth />
        </View>
      </ScrollView>
    </Screen>
  );
}
