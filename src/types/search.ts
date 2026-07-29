import type { GearCondition } from './gear';

export type ActivityType =
  | 'camping'
  | 'hiking'
  | 'snow'
  | 'cycling'
  | 'water'
  | 'family'
  | 'climbing'
  | 'fishing'
  | 'backpacking';

export interface GeoSearchLocation {
  latitude: number;
  longitude: number;
  displayName: string;
}

export type ListingSortOption =
  | 'recommended'
  | 'nearest'
  | 'lowest_price'
  | 'lowest_deposit'
  | 'highest_rated'
  | 'fastest_response'
  | 'most_rented'
  | 'recently_added';

export interface GeoBounds {
  swLatitude: number;
  swLongitude: number;
  neLatitude: number;
  neLongitude: number;
}

export interface ListingSearchInput {
  query?: string;
  activity?: ActivityType;
  categoryId?: string;
  location?: GeoSearchLocation;
  startDate?: string;
  endDate?: string;
  radiusKm?: number;
  minimumDailyPriceMinor?: number;
  maximumDailyPriceMinor?: number;
  maximumDepositMinor?: number;
  verifiedOwnersOnly?: boolean;
  minimumRating?: number;
  conditions?: GearCondition[];
  listingType?: 'item' | 'bundle';
  sort?: ListingSortOption;
  page?: number;
  limit?: number;
}

export interface ListingMapItem {
  id: string;
  listingId: string;
  title: string;
  dailyPrice: number;
  latitude: number;
  longitude: number;
  primaryImageUrl?: string;
  category: string;
}

export interface MapProviderAdapter {
  fitToListings(listings: ListingMapItem[]): void;
  focusListing(listingId: string): void;
}
