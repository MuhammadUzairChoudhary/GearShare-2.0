import type { Rental, RentalStatus } from '../types/rental';

/**
 * Trust & safety rule — a member cannot be an active renter and an active
 * host at the same time. This stops people from renting out gear (their own
 * listing) while they are also holding gear they rented for themselves.
 *
 * Enforcement (both directions):
 * - While a member is actively renting (gear in hand), their own listings are
 *   hidden from the app (Discover, Search, Map, public profile).
 * - While one of a member's listings is actively rented out, they cannot
 *   submit new rental requests.
 *
 * A rental is "in hand" from pickup through return: the gear is physically
 * with the renter only during `active` and `return_due`. Confirmed or
 * pickup-due rentals have not been picked up yet, so they don't count.
 *
 * NOTE: the mock repositories enforce this client-side. The Supabase layer
 * must re-enforce the same rule at the database/policy level (e.g. a
 * check constraint or RPC guard) or it will be bypassable.
 */
export const GEAR_IN_HAND_STATUSES: readonly RentalStatus[] = ['active', 'return_due'];

/** True when the gear is physically in the renter's hands for this status. */
export function isGearInHand(status: RentalStatus): boolean {
  return GEAR_IN_HAND_STATUSES.includes(status);
}

/** Rentals where the gear is currently in the renter's hands. */
export function getRentalsInHand(rentals: Rental[]): Rental[] {
  return rentals.filter((r) => isGearInHand(r.status));
}

/** IDs of members currently holding rented gear (renter side). */
export function getActiveRenterIds(rentals: Rental[]): Set<string> {
  return new Set(getRentalsInHand(rentals).map((r) => r.renterId));
}

/** True when the member is currently holding rented gear (renter side). */
export function isUserActivelyRenting(rentals: Rental[], userId: string): boolean {
  return getRentalsInHand(rentals).some((r) => r.renterId === userId);
}

/** Rentals where one of the member's own listings is currently out (host side). */
export function getActiveHostingRentals(rentals: Rental[], userId: string): Rental[] {
  return getRentalsInHand(rentals).filter((r) => r.ownerId === userId);
}

/** True when one of the member's listings is currently being rented out. */
export function isUserActivelyHosting(rentals: Rental[], userId: string): boolean {
  return getActiveHostingRentals(rentals, userId).length > 0;
}
