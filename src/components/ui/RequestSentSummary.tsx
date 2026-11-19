import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from './AppText';
import { MoneyText } from './MoneyText';
import { Divider } from './Divider';
import { Card } from './Card';
import type { Rental } from '../../types/rental';
import { formatDateRange } from '../../utils/format';

interface RequestSentSummaryProps {
  rental: Rental;
  testID?: string;
}

export function RequestSentSummary({ rental, testID }: RequestSentSummaryProps) {
  const { colors } = useTheme();

  const listing = rental.listing;

  return (
    <View style={{ gap: spacing.xxl }} testID={testID}>
      {/* Success icon & message */}
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.successBackground,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="checkmark-circle" size={40} color={colors.success} />
        </View>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <AppText variant="titleLarge">Request sent</AppText>
          <AppText variant="bodyMedium" color="textSecondary" align="center">
            Waiting for the owner to respond
          </AppText>
        </View>
      </View>

      {/* Reference */}
      <Card>
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodySmall" color="textTertiary">
              Reference
            </AppText>
            <AppText variant="bodyMedium" mono>
              {rental.id.slice(0, 8).toUpperCase()}
            </AppText>
          </View>
          <Divider />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodySmall" color="textTertiary">
              Equipment
            </AppText>
            <AppText variant="bodyMedium">{listing?.gearItem?.name ?? 'Equipment'}</AppText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodySmall" color="textTertiary">
              Dates
            </AppText>
            <AppText variant="bodyMedium" mono>
              {formatDateRange(rental.startDate, rental.endDate)}
            </AppText>
          </View>
          <Divider />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodySmall" color="textTertiary">
              Rental charge
            </AppText>
            <MoneyText minorUnits={rental.rentalCharge} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodySmall" color="textTertiary">
              Deposit hold
            </AppText>
            <MoneyText minorUnits={rental.depositHold} />
          </View>
        </View>
      </Card>

      {/* Next steps */}
      <View style={{ gap: spacing.sm }}>
        <AppText variant="titleSmall">Next steps</AppText>
        <AppText variant="bodyMedium" color="textSecondary">
          The owner usually responds within a few hours. You'll be notified when your request is
          confirmed.
        </AppText>
      </View>
    </View>
  );
}
