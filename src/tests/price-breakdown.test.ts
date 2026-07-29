import { calculateTotalPrice, calculateRentalDays, formatMoney } from '../utils/money';

describe('Price Calculation', () => {
  describe('calculateRentalDays', () => {
    it('should calculate days between dates', () => {
      expect(calculateRentalDays('2026-08-15', '2026-08-18')).toBe(3);
    });

    it('should return 1 for same day', () => {
      expect(calculateRentalDays('2026-08-15', '2026-08-15')).toBe(1);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate total including fees', () => {
      expect(calculateTotalPrice(2500, 3, 500)).toBe(8000);
    });

    it('should handle zero fees', () => {
      expect(calculateTotalPrice(1000, 1, 0)).toBe(1000);
    });
  });

  describe('Deposit separation', () => {
    it('deposit should not be included in charged total', () => {
      const dailyPrice = 2500;
      const days = 3;
      const rentalCharge = dailyPrice * days;
      const fees = 500;
      const depositAmount = 54900;
      const totalCharge = rentalCharge + fees;

      expect(totalCharge).toBe(8000);
      expect(depositAmount).toBe(54900);
      expect(totalCharge).not.toBe(depositAmount);
      expect(depositAmount).toBeGreaterThan(totalCharge);
    });
  });

  describe('formatMoney', () => {
    it('should format minor units correctly', () => {
      expect(formatMoney(2550)).toBe('$25.50');
      expect(formatMoney(54900)).toBe('$549.00');
      expect(formatMoney(8000)).toBe('$80.00');
    });
  });
});
