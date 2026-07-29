import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from './AppText';
import { MoneyText } from './MoneyText';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Avatar } from './Avatar';
import { getRentalStatusLabel, getRentalStatusVariant, type Rental } from '../../types/rental';

interface RentalSummaryCardProps {
  rental: Rental;
  onPress?: () => void;
  compact?: boolean;
  testID?: string;
}

export function RentalSummaryCard({
  rental,
  onPress,
  compact = false,
  testID,
}: RentalSummaryCardProps) {
  const { colors } = useTheme();

  const otherParty = rental.renterId === rental.ownerId ? rental.owner : rental.owner;

  return (
    <Card onPress={onPress} testID={testID}>
      <View style={{ gap: spacing.md }}>
        {/* Status */}
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

        {/* Dates */}
        <View style={{ flexDirection: 'row', gap: spacing.xl }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Pickup
            </AppText>
            <AppText variant="bodyMedium" mono>
              {rental.startDate}
            </AppText>
          </View>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Return
            </AppText>
            <AppText variant="bodyMedium" mono>
              {rental.endDate}
            </AppText>
          </View>
        </View>

        {/* Other party */}
        {otherParty && !compact && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Avatar uri={otherParty.avatarUrl} name={otherParty.fullName} size="sm" />
            <AppText variant="bodySmall" color="textSecondary">
              {rental.renterId === rental.ownerId ? 'You are renting' : 'with'}{' '}
              {otherParty.fullName}
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
}
