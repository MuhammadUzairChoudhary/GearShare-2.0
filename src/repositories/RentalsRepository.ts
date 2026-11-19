import type { Rental, CreateRentalRequestInput, UpdateRentalInput } from '../types/rental';
import { mockRentals, mockListings } from '../mocks/data';
import { generateId } from '../utils/format';
import { isUserActivelyHosting, isUserActivelyRenting } from '../utils/rentalConflict';

export interface RentalsRepository {
  getUserRentals(userId: string): Promise<Rental[]>;
  getRentalById(id: string): Promise<Rental | null>;
  createRentalRequest(input: CreateRentalRequestInput): Promise<Rental>;
  updateRental(id: string, input: UpdateRentalInput): Promise<Rental>;
}

export class MockRentalsRepository implements RentalsRepository {
  private rentals: Rental[] = [...mockRentals];

  async getUserRentals(userId: string): Promise<Rental[]> {
    return this.rentals.filter((r) => r.renterId === userId || r.ownerId === userId);
  }

  async getRentalById(id: string): Promise<Rental | null> {
    return this.rentals.find((r) => r.id === id) ?? null;
  }

  async createRentalRequest(input: CreateRentalRequestInput): Promise<Rental> {
    const listing = mockListings.find((l) => l.id === input.listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.availabilityStatus !== 'available') {
      throw new Error('Listing is not available');
    }
    // Anti-sub-letting rule (mutual exclusion), enforced at the trust boundary
    // so saved/deep-linked listings can't bypass the browse-side filters:
    // 1. While one of the requester's own listings is rented out, they cannot
    //    request rentals themselves.
    if (isUserActivelyHosting(this.rentals, input.renterId)) {
      throw new Error(
        'One of your listings is currently being rented out, so you cannot request a new rental until it is returned.',
      );
    }
    // 2. While the listing's owner is actively renting gear themselves, their
    //    listings are unavailable.
    if (isUserActivelyRenting(this.rentals, listing.ownerId)) {
      throw new Error(
        'This owner is currently renting gear themselves, so their listings are temporarily unavailable.',
      );
    }

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
    const rentalCharge = listing.dailyPrice * days;
    const feeRate = 0.1;
    const fees = Math.round(rentalCharge * feeRate);

    const rental: Rental = {
      id: `rental-${generateId()}`,
      listingId: input.listingId,
      renterId: input.renterId,
      ownerId: listing.ownerId,
      startDate: input.startDate,
      endDate: input.endDate,
      pickupWindow: input.pickupWindow ?? null,
      returnWindow: input.returnWindow ?? null,
      intendedUse: input.intendedUse ?? null,
      rentalCharge,
      fees,
      depositHold: listing.depositAmount,
      status: 'request_sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      listing,
      owner: listing.owner,
    };

    this.rentals.push(rental);
    return rental;
  }

  async updateRental(id: string, input: UpdateRentalInput): Promise<Rental> {
    const index = this.rentals.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Rental ${id} not found`);
    const existing = this.rentals[index];
    if (!existing) throw new Error(`Rental ${id} not found`);
    const updated = { ...existing, ...input, updatedAt: new Date().toISOString() };
    this.rentals[index] = updated;
    return updated;
  }
}

export class SupabaseRentalsRepository implements RentalsRepository {
  async getUserRentals(_userId: string): Promise<Rental[]> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async getRentalById(_id: string): Promise<Rental | null> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async createRentalRequest(_input: CreateRentalRequestInput): Promise<Rental> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async updateRental(_id: string, _input: UpdateRentalInput): Promise<Rental> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }
}
