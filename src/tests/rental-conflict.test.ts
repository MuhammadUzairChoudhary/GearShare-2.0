import {
  GEAR_IN_HAND_STATUSES,
  getActiveHostingRentals,
  getActiveRenterIds,
  getRentalsInHand,
  isGearInHand,
  isUserActivelyHosting,
  isUserActivelyRenting,
} from '../utils/rentalConflict';
import type { Rental } from '../types/rental';

function makeRental(overrides: Partial<Rental> = {}): Rental {
  return {
    id: 'rental-x',
    listingId: 'listing-x',
    renterId: 'user-renter',
    ownerId: 'user-owner',
    startDate: '',
    endDate: '',
    pickupWindow: null,
    returnWindow: null,
    intendedUse: null,
    rentalCharge: 0,
    fees: 0,
    depositHold: 0,
    status: 'active',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('rental conflict rule', () => {
  it('treats only active and return_due as gear-in-hand', () => {
    expect(GEAR_IN_HAND_STATUSES).toEqual(['active', 'return_due']);
    expect(isGearInHand('active')).toBe(true);
    expect(isGearInHand('return_due')).toBe(true);
    expect(isGearInHand('confirmed')).toBe(false);
    expect(isGearInHand('pickup_due')).toBe(false);
    expect(isGearInHand('request_sent')).toBe(false);
    expect(isGearInHand('completed')).toBe(false);
    expect(isGearInHand('cancelled')).toBe(false);
  });

  it('flags a renter only while the gear is in their hands', () => {
    expect(isUserActivelyRenting([makeRental({ status: 'active' })], 'user-renter')).toBe(true);
    expect(isUserActivelyRenting([makeRental({ status: 'return_due' })], 'user-renter')).toBe(true);
    expect(isUserActivelyRenting([makeRental({ status: 'confirmed' })], 'user-renter')).toBe(false);
    expect(isUserActivelyRenting([makeRental({ status: 'completed' })], 'user-renter')).toBe(false);
    expect(isUserActivelyRenting([makeRental({ status: 'active' })], 'other-user')).toBe(false);
  });

  it('collects the ids of all members currently holding gear', () => {
    const rentals = [
      makeRental({ id: 'r1', renterId: 'a', status: 'active' }),
      makeRental({ id: 'r2', renterId: 'b', status: 'return_due' }),
      makeRental({ id: 'r3', renterId: 'c', status: 'completed' }),
    ];
    expect(getActiveRenterIds(rentals)).toEqual(new Set(['a', 'b']));
    expect(getRentalsInHand(rentals).map((r) => r.id)).toEqual(['r1', 'r2']);
  });

  it('flags a host while one of their listings is currently out', () => {
    expect(isUserActivelyHosting([makeRental({ ownerId: 'host', status: 'active' })], 'host')).toBe(
      true,
    );
    expect(
      isUserActivelyHosting([makeRental({ ownerId: 'host', status: 'confirmed' })], 'host'),
    ).toBe(false);
    expect(
      isUserActivelyHosting([makeRental({ ownerId: 'host', status: 'completed' })], 'host'),
    ).toBe(false);
  });

  it('returns the out listings for the host and none for others', () => {
    const rentals = [
      makeRental({ id: 'r1', ownerId: 'host', status: 'active' }),
      makeRental({ id: 'r2', ownerId: 'host', status: 'return_due' }),
    ];
    expect(getActiveHostingRentals(rentals, 'host').map((r) => r.id)).toEqual(['r1', 'r2']);
    expect(getActiveHostingRentals(rentals, 'someone-else')).toEqual([]);
  });
});
