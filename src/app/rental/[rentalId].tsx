import React from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { MoneyText } from '../../components/ui/MoneyText';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusRail } from '../../components/ui/StatusRail';
import { IconButton } from '../../components/ui/IconButton';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useRental } from '../../hooks/useRentals';
import { spacing } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import {
  getRentalStatusLabel,
  getRentalStatusVariant,
  type RentalStatus,
} from '../../types/rental';
import { formatDate, formatDateTime } from '../../utils/format';

export default function RentalDetailScreen() {
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  const { colors } = useTheme();
  const { data: rental, isLoading, isError, refetch } = useRental(rentalId ?? '');

  if (isLoading) {
    return <LoadingState message="Loading rental details..." />;
  }

  if (isError || !rental) {
    return (
      <Screen>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Rental Details',
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

  const listing = rental.listing;
  const gearItem = listing?.gearItem;
  const otherParty = rental.renterId === rental.ownerId ? rental.owner : rental.owner;
  const isCancelled = rental.status === 'cancelled';
  const isCompleted = rental.status === 'completed';
  const isRequestSent = rental.status === 'request_sent';

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Rental Details',
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
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxxl, gap: spacing.xxl }}>
        {/* Header */}
        <View style={{ gap: spacing.md }}>
          <StatusBadge
            label={getRentalStatusLabel(rental.status)}
            variant={getRentalStatusVariant(rental.status)}
          />
          <AppText variant="displayMedium">{gearItem?.name ?? 'Rental'}</AppText>
          <AppText variant="bodyLarge" color="textSecondary">
            Reference: {rental.id.slice(0, 8).toUpperCase()}
          </AppText>
        </View>

        {/* Status rail for non-terminal states */}
        {!isCancelled && !isCompleted && <StatusRail currentStatus={rental.status} />}

        {/* Request-specific content */}
        {isRequestSent && (
          <Card elevated>
            <View style={{ gap: spacing.sm }}>
              <AppText variant="titleSmall">Request sent</AppText>
              <AppText variant="bodyMedium" color="textSecondary">
                Waiting for the owner to respond. You'll be notified when your request is confirmed.
              </AppText>
            </View>
          </Card>
        )}

        <Divider />

        {/* Equipment info */}
        {gearItem && (
          <View style={{ gap: spacing.md }}>
            <AppText variant="titleSmall">Equipment</AppText>
            <Card
              onPress={listing ? () => router.push(ROUTES.LISTING(rental.listingId)) : undefined}
            >
              <View style={{ gap: spacing.sm }}>
                <AppText variant="titleMedium">{gearItem.name}</AppText>
                {(gearItem.brand || gearItem.model) && (
                  <AppText variant="bodyMedium" color="textSecondary">
                    {[gearItem.brand, gearItem.model].filter(Boolean).join(' ')}
                  </AppText>
                )}
              </View>
            </Card>
          </View>
        )}

        {/* Dates */}
        <View style={{ flexDirection: 'row', gap: spacing.xxl }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Pickup
            </AppText>
            <AppText variant="bodyMedium" mono>
              {formatDate(rental.startDate)}
            </AppText>
            {rental.pickupWindow && (
              <AppText variant="bodySmall" color="textSecondary" mono>
                {rental.pickupWindow}
              </AppText>
            )}
          </View>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Return
            </AppText>
            <AppText variant="bodyMedium" mono>
              {formatDate(rental.endDate)}
            </AppText>
            {rental.returnWindow && (
              <AppText variant="bodySmall" color="textSecondary" mono>
                {rental.returnWindow}
              </AppText>
            )}
          </View>
        </View>

        {/* Intended use */}
        {rental.intendedUse && (
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Intended use
            </AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              {rental.intendedUse}
            </AppText>
          </View>
        )}

        <Divider />

        {/* Charges */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="titleSmall">Charges</AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodyMedium" color="textSecondary">
              Rental charge
            </AppText>
            <MoneyText minorUnits={rental.rentalCharge} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodyMedium" color="textSecondary">
              Fees
            </AppText>
            <MoneyText minorUnits={rental.fees} />
          </View>
          <Divider />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodyMedium">Total charged</AppText>
            <MoneyText minorUnits={rental.rentalCharge + rental.fees} />
          </View>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="bodyMedium" color="textSecondary">
                Deposit hold
              </AppText>
              <MoneyText minorUnits={rental.depositHold} />
            </View>
            <AppText variant="bodySmall" color="textTertiary" style={{ marginTop: spacing.xs }}>
              Not charged unless required
            </AppText>
          </View>
        </View>

        <Divider />

        {/* Other party */}
        {otherParty && (
          <View style={{ gap: spacing.md }}>
            <AppText variant="titleSmall">
              {rental.renterId === rental.ownerId ? 'Renting from' : 'Renter'}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar uri={otherParty.avatarUrl} name={otherParty.fullName} size="md" />
              <View>
                <AppText variant="bodyMedium">{otherParty.fullName}</AppText>
                {otherParty.location && (
                  <AppText variant="bodySmall" color="textSecondary">
                    {otherParty.location}
                  </AppText>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={{ gap: spacing.md }}>
          <AppButton
            title="Message Owner"
            onPress={() => router.push(ROUTES.TABS.INBOX)}
            variant="secondary"
            fullWidth
          />
          {isRequestSent && (
            <AppButton title="Cancel Request" onPress={() => {}} variant="ghost" fullWidth />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
