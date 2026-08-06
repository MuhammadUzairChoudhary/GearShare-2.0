import {
  filterConversations,
  filterConversationsByTab,
  countArchivedWithUnread,
} from '../utils/conversations';
import type { Conversation } from '../types/message';
import type { Profile } from '../types/profile';

function makeConversation(
  rentalId: string,
  listingName: string,
  fullName: string,
  overrides: Partial<Conversation> = {},
): Conversation {
  const otherParty: Profile = {
    id: `user-${rentalId}`,
    fullName,
    avatarUrl: null,
    location: null,
    bio: null,
    isRenter: true,
    isOwner: false,
    verificationStatus: 'verified',
    ratingAverage: 4.5,
    ratingCount: 1,
    lastActiveAt: null,
    createdAt: '',
    updatedAt: '',
  };
  return {
    rentalId,
    otherParty,
    listingName,
    listingImageUrl: null,
    status: 'confirmed',
    contextLabel: null,
    lastMessage: null,
    unreadCount: 0,
    updatedAt: '',
    archived: false,
    ...overrides,
  };
}

const conversations = [
  makeConversation('rental-1', 'Big Agnes Copper Spur HV UL2', 'Jordan Lee'),
  makeConversation('rental-2', 'Black Diamond Camalot C4', 'Sam Rivera'),
];

describe('filterConversations', () => {
  it('returns everything for an empty query', () => {
    expect(filterConversations(conversations, '')).toHaveLength(2);
    expect(filterConversations(conversations, '   ')).toHaveLength(2);
  });

  it('filters by item name, case-insensitively', () => {
    const results = filterConversations(conversations, 'black diamond');
    expect(results).toHaveLength(1);
    expect(results[0]?.rentalId).toBe('rental-2');
  });

  it('filters by person name', () => {
    const results = filterConversations(conversations, 'jordan');
    expect(results).toHaveLength(1);
    expect(results[0]?.rentalId).toBe('rental-1');
  });

  it('returns no results when nothing matches', () => {
    expect(filterConversations(conversations, 'hasselblad')).toHaveLength(0);
  });
});

describe('filterConversationsByTab', () => {
  const tabbed = [
    makeConversation('rental-1', 'Tent', 'A', { unreadCount: 2 }),
    makeConversation('rental-2', 'Bike', 'B', { archived: true }),
    makeConversation('rental-3', 'Skis', 'C', { archived: true, unreadCount: 1 }),
    makeConversation('rental-4', 'Kayak', 'D'),
  ];

  it('keeps everything except manually archived on All', () => {
    const results = filterConversationsByTab(tabbed, 'all');
    expect(results.map((c) => c.rentalId)).toEqual(['rental-1', 'rental-4']);
  });

  it('shows only unread, non-archived conversations on Unread', () => {
    const results = filterConversationsByTab(tabbed, 'updates');
    expect(results.map((c) => c.rentalId)).toEqual(['rental-1']);
  });

  it('shows only manually archived conversations on Archived', () => {
    const results = filterConversationsByTab(tabbed, 'archived');
    expect(results.map((c) => c.rentalId)).toEqual(['rental-2', 'rental-3']);
  });
});

describe('countArchivedWithUnread', () => {
  it('counts conversations, not total unread messages', () => {
    const list = [
      makeConversation('rental-1', 'Tent', 'A', { archived: true, unreadCount: 5 }),
      makeConversation('rental-2', 'Bike', 'B', { archived: true, unreadCount: 1 }),
    ];
    expect(countArchivedWithUnread(list)).toBe(2);
  });

  it('ignores unread chats that are not archived', () => {
    const list = [
      makeConversation('rental-1', 'Tent', 'A', { unreadCount: 3 }),
      makeConversation('rental-2', 'Bike', 'B', { archived: true, unreadCount: 1 }),
    ];
    expect(countArchivedWithUnread(list)).toBe(1);
  });

  it('ignores archived chats with no new messages', () => {
    const list = [
      makeConversation('rental-1', 'Tent', 'A', { archived: true, unreadCount: 0 }),
      makeConversation('rental-2', 'Bike', 'B', { archived: true }),
    ];
    expect(countArchivedWithUnread(list)).toBe(0);
  });

  it('returns 0 for an empty list', () => {
    expect(countArchivedWithUnread([])).toBe(0);
  });
});
