import {
  RENTAL_STATUS_LABELS,
  RENTAL_STATUS_VARIANTS,
  getRentalStatusLabel,
  getRentalStatusVariant,
} from '../types/rental';

describe('Rental Status', () => {
  describe('RENTAL_STATUS_LABELS', () => {
    it('should have all status labels', () => {
      expect(RENTAL_STATUS_LABELS.request_sent).toBe('Request Sent');
      expect(RENTAL_STATUS_LABELS.waiting_for_owner).toBe('Waiting for Owner');
      expect(RENTAL_STATUS_LABELS.action_required).toBe('Action Required');
      expect(RENTAL_STATUS_LABELS.confirmed).toBe('Confirmed');
      expect(RENTAL_STATUS_LABELS.pickup_due).toBe('Pickup Due');
      expect(RENTAL_STATUS_LABELS.active).toBe('Active');
      expect(RENTAL_STATUS_LABELS.return_due).toBe('Return Due');
      expect(RENTAL_STATUS_LABELS.under_review).toBe('Under Review');
      expect(RENTAL_STATUS_LABELS.completed).toBe('Completed');
      expect(RENTAL_STATUS_LABELS.cancelled).toBe('Cancelled');
    });
  });

  describe('RENTAL_STATUS_VARIANTS', () => {
    it('should have correct variant mappings', () => {
      expect(RENTAL_STATUS_VARIANTS.completed).toBe('success');
      expect(RENTAL_STATUS_VARIANTS.cancelled).toBe('error');
      expect(RENTAL_STATUS_VARIANTS.confirmed).toBe('info');
      expect(RENTAL_STATUS_VARIANTS.active).toBe('success');
    });
  });

  describe('getRentalStatusLabel', () => {
    it('should return correct label for status', () => {
      expect(getRentalStatusLabel('request_sent')).toBe('Request Sent');
      expect(getRentalStatusLabel('completed')).toBe('Completed');
    });
  });

  describe('getRentalStatusVariant', () => {
    it('should return correct variant for status', () => {
      expect(getRentalStatusVariant('active')).toBe('success');
      expect(getRentalStatusVariant('cancelled')).toBe('error');
    });
  });
});
