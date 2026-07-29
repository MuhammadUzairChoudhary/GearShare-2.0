import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from './AppText';
import { MoneyText } from './MoneyText';
import { formatMoney } from '../../utils/money';

interface PriceBreakdownProps {
  dailyPrice: number;
  days: number;
  rentalCharge: number;
  serviceFee: number;
  protectionFee: number;
  taxes: number;
  totalCharge: number;
  depositAmount: number;
  testID?: string;
}

export function PriceBreakdown({
  dailyPrice,
  days,
  rentalCharge,
  serviceFee,
  protectionFee,
  taxes,
  totalCharge,
  depositAmount,
  testID,
}: PriceBreakdownProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: spacing.sm }} testID={testID}>
      <AppText variant="titleSmall">Price Breakdown</AppText>

      <View style={{ gap: spacing.sm }}>
        <Row
          label={`${formatMoney(dailyPrice)} x ${days} day${days > 1 ? 's' : ''}`}
          value={<MoneyText minorUnits={rentalCharge} variant="amount" />}
        />
        <Row
          label="Service fee"
          value={<MoneyText minorUnits={serviceFee} variant="amount" />}
        />
        <Row
          label="Protection fee"
          value={<MoneyText minorUnits={protectionFee} variant="amount" />}
        />
        <Row
          label="Taxes"
          value={<MoneyText minorUnits={taxes} variant="amount" />}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing.sm,
        }}
      >
        <AppText variant="titleSmall">Charged</AppText>
        <MoneyText minorUnits={totalCharge} variant="amount" />
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          gap: spacing.sm,
        }}
      >
        <Row
          label="Deposit hold"
          value={<MoneyText minorUnits={depositAmount} variant="amount" />}
        />
        <AppText variant="bodySmall" color="textTertiary">
          Not charged unless required
        </AppText>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <AppText variant="bodyMedium" color="textSecondary">
        {label}
      </AppText>
      {value}
    </View>
  );
}
