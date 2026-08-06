export const API_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  CACHE: {
    STALE_TIME: 1000 * 60 * 5, // 5 minutes
    GC_TIME: 1000 * 60 * 30, // 30 minutes
    RETRY_COUNT: 2,
  },
  REALTIME: {
    RENTAL_CHANNEL: 'rental_updates',
    MESSAGE_CHANNEL: 'rental_messages',
  },
  STORAGE: {
    LISTING_IMAGES: 'listing-images',
    CONDITION_IMAGES: 'condition-images',
    AVATARS: 'avatars',
  },
} as const;

export const QUERY_KEYS = {
  listings: {
    all: ['listings'] as const,
    featured: () => ['listings', 'featured'] as const,
    search: (params: Record<string, unknown>) => ['listings', 'search', params] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
    byOwner: (ownerId: string) => ['listings', 'byOwner', ownerId] as const,
  },
  rentals: {
    all: ['rentals'] as const,
    asRenter: (userId: string) => ['rentals', 'asRenter', userId] as const,
    asOwner: (userId: string) => ['rentals', 'asOwner', userId] as const,
    detail: (id: string) => ['rentals', 'detail', id] as const,
  },
  messages: {
    byRental: (rentalId: string) => ['messages', rentalId] as const,
    conversations: (userId: string) => ['messages', 'conversations', userId] as const,
    conversationsAll: ['messages', 'conversations'] as const,
  },
  profile: {
    me: ['profile', 'me'] as const,
    byId: (id: string) => ['profile', id] as const,
  },
  savedListings: {
    all: (userId: string) => ['savedListings', userId] as const,
  },
  payments: {
    methods: ['payments', 'methods'] as const,
  },
} as const;

export const QUERY_CONFIG = {
  defaultStaleTime: API_CONFIG.CACHE.STALE_TIME,
  defaultGcTime: API_CONFIG.CACHE.GC_TIME,
  defaultRetryCount: API_CONFIG.CACHE.RETRY_COUNT,
} as const;
