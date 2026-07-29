import { rentalRequestSchema } from '../schemas';

describe('Rental Request Schema', () => {
  it('should validate a correct rental request', () => {
    const result = rentalRequestSchema.safeParse({
      listingId: 'listing-1',
      startDate: '2026-08-15',
      endDate: '2026-08-18',
      intendedUse: 'Weekend trip',
    });
    expect(result.error).toBeUndefined();
  });

  it('should reject missing listingId', () => {
    const result = rentalRequestSchema.safeParse({
      listingId: '',
      startDate: '2026-08-15',
      endDate: '2026-08-18',
    });
    expect(result.error).toBeDefined();
  });

  it('should reject missing dates', () => {
    const result = rentalRequestSchema.safeParse({
      listingId: 'listing-1',
      startDate: '',
      endDate: '',
    });
    expect(result.error).toBeDefined();
  });
});
