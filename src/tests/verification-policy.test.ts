import { MockVerificationPolicy } from '../types/verification';
import type { Profile } from '../types/profile';
import type { Listing } from '../types/listing';

describe('Verification Policy', () => {
  const policy = new MockVerificationPolicy();

  const mockProfile: Profile = {
    id: 'user-1',
    fullName: 'Test User',
    avatarUrl: null,
    location: null,
    bio: null,
    isRenter: true,
    isOwner: false,
    verificationStatus: 'unverified',
    ratingAverage: null,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockListing: Listing = {
    id: 'listing-1',
    gearItemId: 'gear-1',
    ownerId: 'owner-1',
    dailyPrice: 2500,
    depositAmount: 54900,
    pickupArea: null,
    availabilityStatus: 'available',
    minRentalDuration: 1,
    policies: null,
    publishedStatus: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  it('should return not required in mock mode', () => {
    const result = policy.evaluate({
      user: mockProfile,
      listing: mockListing,
      rentalValueMinor: 7500,
      depositMinor: 54900,
    });
    expect(result.required).toBe(false);
  });
});
