/**
 * Monetary amounts are stored as integer minor units (cents) throughout the app.
 * Example: $25.50 is stored as 2550.
 */

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

export function formatMoney(
  minorUnits: number,
  options?: {
    locale?: string;
    currency?: string;
    showSymbol?: boolean;
    showCode?: boolean;
  },
): string {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    showSymbol = true,
    showCode = false,
  } = options ?? {};

  const majorUnits = minorUnits / 100;

  if (showCode) {
    return `${majorUnits.toFixed(2)} ${currency}`;
  }

  if (!showSymbol) {
    return majorUnits.toFixed(2);
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(majorUnits);
  } catch {
    return `${currency} ${majorUnits.toFixed(2)}`;
  }
}

export function formatDepositDescription(minorUnits: number): string {
  const formatted = formatMoney(minorUnits);
  return `Security deposit: ${formatted}`;
}

export function formatDailyPrice(minorUnits: number): string {
  const formatted = formatMoney(minorUnits, { showSymbol: true });
  return `${formatted}/day`;
}

export function parseMoneyInput(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const majorUnits = parseFloat(cleaned);
  if (Number.isNaN(majorUnits)) return 0;
  return Math.round(majorUnits * 100);
}

export function calculateTotalPrice(dailyPrice: number, days: number, fees: number): number {
  return dailyPrice * days + fees;
}

export function calculateRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
