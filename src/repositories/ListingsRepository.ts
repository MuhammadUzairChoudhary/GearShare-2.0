import type { Listing, ListingMapItem } from '../types/listing';
import type { ListingSearchInput } from '../types/search';
import { mockListings, mockListingCoordinates } from '../mocks/data';

export interface ListingsRepository {
  getFeaturedListings(): Promise<Listing[]>;
  searchListings(input: ListingSearchInput): Promise<Listing[]>;
  getListingById(id: string): Promise<Listing | null>;
  getMapListings(input: ListingSearchInput): Promise<ListingMapItem[]>;
}

export class MockListingsRepository implements ListingsRepository {
  async getFeaturedListings(): Promise<Listing[]> {
    return mockListings.filter(
      (l) => l.publishedStatus === 'published' && l.availabilityStatus === 'available',
    );
  }

  async searchListings(input: ListingSearchInput): Promise<Listing[]> {
    let results = mockListings.filter((l) => l.publishedStatus === 'published');

    if (input.query) {
      const q = input.query.toLowerCase();
      results = results.filter(
        (l) =>
          l.gearItem?.name.toLowerCase().includes(q) ||
          l.gearItem?.description.toLowerCase().includes(q) ||
          l.gearItem?.brand?.toLowerCase().includes(q) ||
          l.gearItem?.model?.toLowerCase().includes(q),
      );
    }

    if (input.activity || input.categoryId) {
      const activity = input.activity ?? input.categoryId;
      results = results.filter((l) => {
        const cat = l.gearItem?.category ?? '';
        if (activity === 'snow') {
          return cat === 'skiing' || cat === 'snowboarding' || cat === 'winter_sports';
        }
        if (activity === 'water') {
          return cat === 'water_sports' || cat === 'kayaking' || cat === 'fishing';
        }
        if (activity === 'family') {
          return cat === 'camping' || cat === 'hiking' || cat === 'cycling';
        }
        return cat === activity;
      });
    }

    if (input.startDate && input.endDate) {
      results = results.filter((l) => l.availabilityStatus === 'available');
    }

    if (input.minimumDailyPriceMinor !== undefined) {
      results = results.filter((l) => l.dailyPrice >= Number(input.minimumDailyPriceMinor));
    }

    if (input.maximumDailyPriceMinor !== undefined) {
      results = results.filter((l) => l.dailyPrice <= Number(input.maximumDailyPriceMinor));
    }

    if (input.maximumDepositMinor !== undefined) {
      results = results.filter((l) => l.depositAmount <= Number(input.maximumDepositMinor));
    }

    if (input.verifiedOwnersOnly) {
      results = results.filter((l) => l.owner?.verificationStatus === 'verified');
    }

    if (input.minimumRating !== undefined) {
      results = results.filter((l) => (l.owner?.ratingAverage ?? 0) >= Number(input.minimumRating));
    }

    if (input.conditions && input.conditions.length > 0) {
      results = results.filter(
        (l) => l.gearItem?.condition && input.conditions!.includes(l.gearItem.condition),
      );
    }

    results = this.applySorting(results, input.sort);

    const page = input.page ?? 0;
    const limit = input.limit ?? 20;
    return results.slice(page * limit, (page + 1) * limit);
  }

  private applySorting(listings: Listing[], sort?: string): Listing[] {
    const sorted = [...listings];
    switch (sort) {
      case 'lowest_price':
        sorted.sort((a, b) => a.dailyPrice - b.dailyPrice);
        break;
      case 'lowest_deposit':
        sorted.sort((a, b) => a.depositAmount - b.depositAmount);
        break;
      case 'highest_rated':
        sorted.sort((a, b) => (b.owner?.ratingAverage ?? 0) - (a.owner?.ratingAverage ?? 0));
        break;
      case 'most_rented':
        sorted.sort((a, b) => (b.owner?.ratingCount ?? 0) - (a.owner?.ratingCount ?? 0));
        break;
      case 'recently_added':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'fastest_response':
      case 'nearest':
      case 'recommended':
      default:
        sorted.sort((a, b) => (b.owner?.ratingAverage ?? 0) - (a.owner?.ratingAverage ?? 0));
        break;
    }
    return sorted;
  }

  async getListingById(id: string): Promise<Listing | null> {
    return mockListings.find((l) => l.id === id) ?? null;
  }

  async getMapListings(input: ListingSearchInput): Promise<ListingMapItem[]> {
    const results = await this.searchListings(input);
    return results
      .filter((l) => mockListingCoordinates[l.id] !== undefined)
      .map((l) => {
        const coords = mockListingCoordinates[l.id];
        return {
          id: `${l.id}-map`,
          listingId: l.id,
          title: l.gearItem?.name ?? 'Unknown',
          dailyPrice: l.dailyPrice,
          latitude: coords?.lat ?? 0,
          longitude: coords?.lng ?? 0,
          primaryImageUrl: l.images?.[0]?.storagePath,
          category: l.gearItem?.category ?? 'other',
        };
      });
  }
}

export class SupabaseListingsRepository implements ListingsRepository {
  async getFeaturedListings(): Promise<Listing[]> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async searchListings(_input: ListingSearchInput): Promise<Listing[]> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async getListingById(_id: string): Promise<Listing | null> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async getMapListings(_input: ListingSearchInput): Promise<ListingMapItem[]> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }
}
