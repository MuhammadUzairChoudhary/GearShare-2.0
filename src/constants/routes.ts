export const ROUTES = {
  // Auth routes
  AUTH: {
    INDEX: '/(auth)',
    SIGN_IN: '/(auth)/sign-in',
    REGISTER: '/(auth)/register',
    VERIFY: '/(auth)/verify',
  },

  // Tab routes
  TABS: {
    INDEX: '/(tabs)',
    DISCOVER: '/(tabs)/discover',
    RENTALS: '/(tabs)/rentals',
    INBOX: '/(tabs)/inbox',
    ACCOUNT: '/(tabs)/account',
  },

  // Detail routes
  LISTING: (id: string) => `/listing/${id}` as const,
  RENTAL: (id: string) => `/rental/${id}` as const,
  ISSUE: (id: string) => `/issue/${id}` as const,
  CHAT: (rentalId: string) => `/chat/${rentalId}` as const,

  // Owner routes
  OWNER: {
    INDEX: '/owner',
    NEW_LISTING: '/owner/listing/new',
    EDIT_LISTING: (id: string) => `/owner/listing/${id}` as const,
  },
} as const;

export const TAB_ICONS = {
  discover: 'compass-outline' as const,
  discoverFocused: 'compass' as const,
  rentals: 'briefcase-outline' as const,
  rentalsFocused: 'briefcase' as const,
  inbox: 'chatbubble-outline' as const,
  inboxFocused: 'chatbubble' as const,
  account: 'person-outline' as const,
  accountFocused: 'person' as const,
} as const;
