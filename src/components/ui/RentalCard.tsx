import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { Card } from './Card';
import { AppText } from './AppText';
import { MoneyText } from './MoneyText';
import { StatusBadge } from './StatusBadge';
import { StatusRail } from './StatusRail';
import { Avatar } from './Avatar';
import { getRentalStatusLabel, getRentalStatusVariant, type Rental } from '../../types/rental';
import { formatDate } from '../../utils/format';

interface RentalCardProps {
  rental: Rental;
  onPress: (rentalId: string) => void;
  testID?: string;
}

export function RentalCard({ rental, onPress, testID }: RentalCardProps) {
  const { colors } = useTheme();

  const otherParty = rental.renterId === rental.ownerId ? rental.renter : rental.renter;

  const containerStyle: ViewStyle = {
    gap: spacing.md,
  };

  return (
    <Card
      onPress={() => onPress(rental.id)}
      testID={testID}
      accessibilityLabel={`Rental ${getRentalStatusLabel(rental.status)} - ${formatDate(rental.startDate)} to ${formatDate(rental.endDate)}`}
    >
      <View style={containerStyle}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1, gap: spacing.xs }}>
            <StatusBadge
              label={getRentalStatusLabel(rental.status)}
              variant={getRentalStatusVariant(rental.status)}
            />
            <AppText variant="titleSmall">{rental.listing?.gearItem?.name ?? 'Rental'}</AppText>
          </View>
          <MoneyText minorUnits={rental.rentalCharge} variant="amount" />
        </View>

        {/* Dates */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.lg,
          }}
        >
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              Start
            </AppText>
            <AppText variant="bodyMedium" mono>
              {formatDate(rental.startDate)}
            </AppText>
          </View>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodySmall" color="textTertiary">
              End
            </AppText>
            <AppText variant="bodyMedium" mono>
              {formatDate(rental.endDate)}
            </AppText>
          </View>
        </View>

        {/* Status rail */}
        <StatusRail currentStatus={rental.status} />

        {/* Other party */}
        {otherParty && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Avatar uri={otherParty.avatarUrl} name={otherParty.fullName} size="sm" />
            <AppText variant="bodySmall" color="textSecondary">
              with {otherParty.fullName}
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
}
