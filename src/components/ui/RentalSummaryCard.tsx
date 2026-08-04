import React from 'react';
import { View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { AppText } from './AppText';
import { MoneyText } from './MoneyText';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Avatar } from './Avatar';
import { getRentalStatusLabel, getRentalStatusVariant, type Rental } from '../../types/rental';
import { formatShortDate } from '../../utils/format';
import { formatMoney, calculateRentalDays } from '../../utils/money';

interface RentalSummaryCardProps {
  rental: Rental;
  onPress?: () => void;
  /** The signed-in user, used to phrase "from {owner}" vs "to {renter}". */
  currentUserId?: string;
  compact?: boolean;
  testID?: string;
}

export function RentalSummaryCard({
  rental,
  onPress,
  currentUserId,
  compact = false,
  testID,
}: RentalSummaryCardProps) {
  // Without a known current user, keep the historical default (show the owner).
  const isRenter = currentUserId !== undefined && rental.renterId === currentUserId;
  const otherParty = isRenter ? rental.owner : currentUserId === undefined ? rental.owner : (rental.renter ?? rental.owner);
  const days = calculateRentalDays(rental.startDate, rental.endDate);

  return (
    <Card
      onPress={onPress}
      testID={testID}
      accessibilityLabel={`Rental ${getRentalStatusLabel(rental.status)} - ${formatShortDate(rental.startDate)} to ${formatShortDate(rental.endDate)}`}
    >
      <View style={{ gap: spacing.md }}>
        {/* Status + charge */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <StatusBadge
            label={getRentalStatusLabel(rental.status)}
            variant={getRentalStatusVariant(rental.status)}
          />
          {!compact && <MoneyText minorUnits={rental.rentalCharge} variant="amount" />}
        </View>

        {/* Equipment name */}
        <AppText variant="titleMedium">
          {rental.listing?.gearItem?.name ?? 'Equipment Rental'}
        </AppText>

        {/* Pickup / Return dates */}
        <View style={{ flexDirection: 'row', gap: spacing.xl }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Pickup
            </AppText>
            <AppText variant="bodyMedium" mono>
              {formatShortDate(rental.startDate)}
            </AppText>
          </View>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Return
            </AppText>
            <AppText variant="bodyMedium" mono>
              {formatShortDate(rental.endDate)}
            </AppText>
          </View>
        </View>

        {/* Duration + deposit hold — trust-critical, kept explicit */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <AppText variant="monoSmall" color="textTertiary">
            {days} day{days !== 1 ? 's' : ''}
          </AppText>
          <AppText variant="monoSmall" color="textTertiary">
            {formatMoney(rental.depositHold)} deposit hold
          </AppText>
        </View>

        {/* Other party */}
        {otherParty && !compact && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Avatar uri={otherParty.avatarUrl} name={otherParty.fullName} size="sm" />
            <AppText variant="bodySmall" color="textSecondary">
              {isRenter ? 'from' : 'to'} {otherParty.fullName}
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
}
