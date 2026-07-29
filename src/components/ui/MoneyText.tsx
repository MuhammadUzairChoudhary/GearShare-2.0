import React from 'react';
import { AppText, type AppTextProps } from './AppText';
import { formatMoney, formatDailyPrice, formatDepositDescription } from '../../utils/money';

interface MoneyTextProps extends Omit<AppTextProps, 'children' | 'variant'> {
  minorUnits: number;
  variant?: 'amount' | 'dailyPrice' | 'deposit';
  showSymbol?: boolean;
}

export function MoneyText({
  minorUnits,
  variant = 'amount',
  showSymbol = true,
  ...textProps
}: MoneyTextProps) {
  const formatted =
    variant === 'dailyPrice'
      ? formatDailyPrice(minorUnits)
      : variant === 'deposit'
        ? formatDepositDescription(minorUnits)
        : formatMoney(minorUnits, { showSymbol });

  return (
    <AppText
      {...textProps}
      mono
      accessibilityLabel={`${variant === 'dailyPrice' ? 'Daily price' : variant === 'deposit' ? 'Deposit' : 'Amount'}: ${formatMoney(minorUnits, { showCode: true })}`}
    >
      {formatted}
    </AppText>
  );
}
