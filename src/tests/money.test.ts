import {
  formatMoney,
  formatDailyPrice,
  formatDepositDescription,
  parseMoneyInput,
  calculateTotalPrice,
  calculateRentalDays,
} from '../utils/money';

describe('Money Utilities', () => {
  describe('formatMoney', () => {
    it('should format minor units as currency string', () => {
      expect(formatMoney(2550)).toBe('$25.50');
      expect(formatMoney(100)).toBe('$1.00');
      expect(formatMoney(0)).toBe('$0.00');
    });

    it('should show code when requested', () => {
      expect(formatMoney(2550, { showCode: true })).toBe('25.50 USD');
    });

    it('should hide symbol when requested', () => {
      expect(formatMoney(2550, { showSymbol: false })).toBe('25.50');
    });
  });

  describe('formatDailyPrice', () => {
    it('should format as daily price', () => {
      expect(formatDailyPrice(2500)).toBe('$25.00/day');
      expect(formatDailyPrice(4500)).toBe('$45.00/day');
    });
  });

  describe('formatDepositDescription', () => {
    it('should format deposit description', () => {
      expect(formatDepositDescription(54900)).toBe('Security deposit: $549.00');
    });
  });

  describe('parseMoneyInput', () => {
    it('should parse dollar strings to minor units', () => {
      expect(parseMoneyInput('25.50')).toBe(2550);
      expect(parseMoneyInput('100')).toBe(10000);
      expect(parseMoneyInput('0.99')).toBe(99);
    });

    it('should handle invalid input', () => {
      expect(parseMoneyInput('abc')).toBe(0);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate total including fees', () => {
      expect(calculateTotalPrice(2500, 3, 500)).toBe(8000);
    });
  });

  describe('calculateRentalDays', () => {
    it('should calculate days between dates', () => {
      expect(calculateRentalDays('2026-08-15', '2026-08-18')).toBe(3);
    });

    it('should return 1 for same day', () => {
      expect(calculateRentalDays('2026-08-15', '2026-08-15')).toBe(1);
    });
  });
});
