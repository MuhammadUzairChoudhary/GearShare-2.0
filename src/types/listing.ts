import type { GearItem } from './gear';
import type { Profile } from './profile';
import type { ActivityType, ListingSortOption, GeoSearchLocation } from './search';
import type { GearCondition } from './gear';

export type AvailabilityStatus = 'available' | 'unavailable' | 'booked';
export type PublishedStatus = 'draft' | 'published' | 'archived';
export type ImageType = 'primary' | 'gallery' | 'condition';

export interface ListingImage {
  id: string;
  listingId: string;
  storagePath: string;
  sortOrder: number;
  imageType: ImageType;
  createdAt: string;
}

export interface Listing {
  id: string;
  gearItemId: string;
  ownerId: string;
  dailyPrice: number;
  depositAmount: number;
  pickupArea: string | null;
  availabilityStatus: AvailabilityStatus;
  minRentalDuration: number;
  policies: string[] | null;
  publishedStatus: PublishedStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Joined relations
  gearItem?: GearItem;
  owner?: Profile;
  images?: ListingImage[];
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
  [key: string]: unknown;
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

export type ListingCreateInput = Pick<Listing, 'gearItemId' | 'dailyPrice' | 'depositAmount'> &
  Partial<Pick<Listing, 'pickupArea' | 'minRentalDuration' | 'policies' | 'publishedStatus'>>;

export type ListingUpdateInput = Partial<
  Pick<
    Listing,
    | 'dailyPrice'
    | 'depositAmount'
    | 'pickupArea'
    | 'availabilityStatus'
    | 'minRentalDuration'
    | 'policies'
    | 'publishedStatus'
  >
>;

export interface SavedListing {
  userId: string;
  listingId: string;
  savedAt: string;
}
