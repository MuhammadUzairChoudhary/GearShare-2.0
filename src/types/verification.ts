import type { Profile } from './profile';
import type { Listing } from './listing';

export type VerificationRequirement =
  | { required: false }
  | {
      required: true;
      reason: 'high_value' | 'high_deposit' | 'new_user';
      minimumVerificationLevel: 'email' | 'phone' | 'identity';
    };

export interface RentalVerificationPolicy {
  evaluate(input: {
    user: Profile;
    listing: Listing;
    rentalValueMinor: number;
    depositMinor: number;
  }): VerificationRequirement;
}

export class MockVerificationPolicy implements RentalVerificationPolicy {
  evaluate(_input: {
    user: Profile;
    listing: Listing;
    rentalValueMinor: number;
    depositMinor: number;
  }): VerificationRequirement {
    // Deterministic mock: always allow in mock mode
    return { required: false };
  }
}
