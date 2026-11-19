import React from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { AppText } from './AppText';
import { MoneyText } from './MoneyText';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { getRentalStatusLabel, type Rental } from '../../types/rental';
import { formatDateRange } from '../../utils/format';
import { formatMoney } from '../../utils/money';

interface RentalSummaryCardProps {
  rental: Rental;
  /**
   * Which side of the rental the signed-in user is on. The tab bar already
   * communicates direction (Borrowing vs Lending), so the card shows the
   * counterparty by name alone — no 'from' / 'to' prefixes.
   */
  role?: 'renter' | 'owner';
  onPress?: () => void;
  testID?: string;
}

/**
 * Compact rental summary card.
 *
 * A strict 2-column grid — left = identity/context, right = state/value —
 * with no coloured status pills and no concatenated prefixes:
 *   1. Gear name (strongest) · status (plain muted text, right)
 *   2. Other party (avatar + name) · total charge (mono, prominent)
 *   3. Dates (muted) · deposit hold (muted)
 */
export function RentalSummaryCard({
  rental,
  onPress,
  role = 'renter',
  testID,
}: RentalSummaryCardProps) {
  const { colors } = useTheme();
  const otherParty =
    role === 'owner' ? (rental.renter ?? rental.owner) : (rental.owner ?? rental.renter);
  const gearName = rental.listing?.gearItem?.name ?? 'Equipment Rental';
  const primaryImage = rental.listing?.images?.[0]?.storagePath;
  const datesLabel = formatDateRange(rental.startDate, rental.endDate);
  const statusLabel = getRentalStatusLabel(rental.status);

  return (
    <Card
      onPress={onPress}
      testID={testID}
      accessibilityLabel={`Rental ${gearName}, ${statusLabel} - ${datesLabel}${otherParty ? `, ${otherParty.fullName}` : ''}`}
      style={{ padding: spacing.md }}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        {/* Gear thumbnail */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.image,
            backgroundColor: colors.surface,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={gearName}
            />
          ) : (
            <Ionicons name="image-outline" size={24} color={colors.graphite300} />
          )}
        </View>

        <View style={{ flex: 1, gap: spacing.xs }}>
          {/* ── Row 1: gear · status (plain text — no pill, no colour) ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <AppText
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: fontFamilies.spaceGrotesk.semiBold,
                fontSize: rf(15),
                lineHeight: rf(20),
              }}
            >
              {gearName}
            </AppText>
            <AppText variant="labelMedium" color="textSecondary" numberOfLines={1}>
              {statusLabel}
            </AppText>
          </View>

          {/* ── Row 2: other party · total charge ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {otherParty ? (
              <>
                <Avatar uri={otherParty.avatarUrl} name={otherParty.fullName} size={20} />
                <AppText
                  variant="bodySmall"
                  color="textSecondary"
                  numberOfLines={1}
                  style={{ flex: 1 }}
                >
                  {otherParty.fullName}
                </AppText>
              </>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <MoneyText
              minorUnits={rental.rentalCharge}
              variant="amount"
              style={{ fontSize: rf(13), lineHeight: rf(18) }}
            />
          </View>

          {/* ── Row 3: dates · deposit hold ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <AppText
              variant="monoSmall"
              color="textTertiary"
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {datesLabel}
            </AppText>
            <AppText variant="monoSmall" color="textTertiary" numberOfLines={1}>
              {formatMoney(rental.depositHold)} hold
            </AppText>
          </View>
        </View>
      </View>
    </Card>
  );
}
