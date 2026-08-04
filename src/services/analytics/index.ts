export type AnalyticsEvent =
  // Discovery
  | { name: 'discover_viewed'; params?: { source?: string } }
  | { name: 'search_submitted'; params?: { query?: string; category?: string; hasDates?: boolean } }
  | { name: 'search_filters_opened'; params?: { source: string } }
  | { name: 'search_filters_applied'; params?: { filterCount: number } }
  | { name: 'search_sort_changed'; params?: { sortBy: string } }
  | { name: 'search_no_results'; params?: { query?: string; category?: string } }
  | {
      name: 'listing_viewed';
      params?: {
        listingId: string;
        categoryId: string;
        listingType: 'item' | 'bundle';
        source: 'discover' | 'search' | 'saved' | 'shared';
      };
    }
  | { name: 'listing_saved'; params?: { listingId: string } }
  | { name: 'listing_shared'; params?: { listingId: string } }
  | { name: 'rental_request_started'; params?: { listingId: string } }
  | {
      name: 'rental_request_submitted';
      params?: { listingId: string; rentalValueMinor: number; depositMinor: number };
    }
  | { name: 'rental_request_failed'; params?: { listingId: string; reason: string } }
  | { name: 'request_sent_viewed'; params?: { rentalId: string } }
  | { name: 'rentals_viewed'; params?: { filter: 'all' | 'upcoming' | 'past' } }
  | { name: 'authentication_required'; params?: { intent: string } }
  | { name: 'verification_required'; params?: { reason: string } }
  // General
  | { name: 'page_view'; params?: { screen: string } }
  | { name: 'message_sent'; params?: { rentalId: string } }
  | { name: 'sign_up'; params?: { method: string } }
  | { name: 'sign_in'; params?: { method: string } }
  | { name: 'listing_created'; params?: { listingId: string } }
  | { name: 'search_performed'; params?: { query: string; resultsCount: number } };

export interface AnalyticsService {
  trackEvent(event: AnalyticsEvent): void;
  setUserId(userId: string | null): void;
}

class MockAnalyticsService implements AnalyticsService {
  trackEvent(event: AnalyticsEvent): void {
    if (__DEV__) {
      console.log(`[Analytics] ${event.name}`, JSON.stringify(event.params ?? {}));
    }
  }

  setUserId(_userId: string | null): void {
    // No-op in mock mode
  }
}

let analyticsService: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new MockAnalyticsService();
  }
  return analyticsService;
}
