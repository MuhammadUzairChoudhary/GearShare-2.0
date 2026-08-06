import { MockListingsRepository } from '../repositories/ListingsRepository';
import { MockRentalsRepository } from '../repositories/RentalsRepository';
import { MockMessagesRepository } from '../repositories/MessagesRepository';
import { MockProfilesRepository } from '../repositories/ProfilesRepository';

describe('Mock Repositories', () => {
  describe('MockListingsRepository', () => {
    const repo = new MockListingsRepository();

    it('should return featured listings', async () => {
      const listings = await repo.getFeaturedListings();
      expect(listings.length).toBeGreaterThan(0);
      expect(listings[0]?.id).toBeDefined();
      expect(listings[0]?.gearItem).toBeDefined();
    });

    it('should find listing by id', async () => {
      const listing = await repo.getListingById('listing-1');
      expect(listing).not.toBeNull();
      expect(listing?.id).toBe('listing-1');
    });

    it('should return null for unknown id', async () => {
      const listing = await repo.getListingById('unknown');
      expect(listing).toBeNull();
    });

    it('should search by query', async () => {
      const results = await repo.searchListings({ query: 'tent' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by activity', async () => {
      const results = await repo.searchListings({ activity: 'camping' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return published listings by owner', async () => {
      const listings = await repo.getListingsByOwner('user-1');
      expect(listings.length).toBeGreaterThan(0);
      expect(listings.every((l) => l.ownerId === 'user-1')).toBe(true);
      expect(listings.every((l) => l.publishedStatus === 'published')).toBe(true);
    });

    it('should return empty list for owner without listings', async () => {
      const listings = await repo.getListingsByOwner('user-2');
      expect(listings).toHaveLength(0);
    });

    it('should return saved listings for the user', async () => {
      const saved = await repo.getSavedListings('user-1');
      expect(saved.length).toBeGreaterThan(0);
      expect(saved.every((l) => l.publishedStatus === 'published')).toBe(true);
    });
  });

  describe('MockRentalsRepository', () => {
    const repo = new MockRentalsRepository();

    it('should return user rentals', async () => {
      const rentals = await repo.getUserRentals('user-1');
      expect(rentals.length).toBeGreaterThan(0);
    });

    it('should find rental by id', async () => {
      const rental = await repo.getRentalById('rental-1');
      expect(rental).not.toBeNull();
      expect(rental?.id).toBe('rental-1');
    });

    it('should create rental request', async () => {
      const rental = await repo.createRentalRequest({
        listingId: 'listing-1',
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        renterId: 'user-2',
      });
      expect(rental.id).toBeDefined();
      expect(rental.status).toBe('request_sent');
    });
  });

  describe('MockMessagesRepository', () => {
    const repo = new MockMessagesRepository();

    it('should return rental messages', async () => {
      const messages = await repo.getRentalMessages('rental-1');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should send a message', async () => {
      const message = await repo.sendMessage({
        rentalId: 'rental-1',
        body: 'Test message',
        senderId: 'user-1',
      });
      expect(message.id).toBeDefined();
      expect(message.body).toBe('Test message');
    });

    it('should return conversations with the counterparty and unread counts', async () => {
      // Fresh repo: the sendMessage test above mutates shared state (newest
      // message on rental-1), which would otherwise break newest-first ordering.
      const freshRepo = new MockMessagesRepository();
      const conversations = await freshRepo.getConversations('user-1');
      expect(conversations.length).toBeGreaterThan(0);

      // user-1 rents rental-2 → other party is the owner (Sam Rivera)
      const rental2 = conversations.find((c) => c.rentalId === 'rental-2');
      expect(rental2).toBeDefined();
      expect(rental2?.otherParty.fullName).toBe('Sam Rivera');
      expect(rental2?.unreadCount).toBe(1); // msg-4 from Sam is unread
      expect(rental2?.lastMessage?.body).toContain('Pickup is confirmed');

      // Newest first
      expect(conversations[0]?.rentalId).toBe('rental-2');
    });

    it('should return no conversations for a user without rentals', async () => {
      const conversations = await repo.getConversations('user-999');
      expect(conversations).toHaveLength(0);
    });

    it('should archive conversations (flagged for the Archived tab)', async () => {
      const freshRepo = new MockMessagesRepository();
      await freshRepo.archiveConversations(['rental-2']);
      const conversations = await freshRepo.getConversations('user-1');
      const rental2 = conversations.find((c) => c.rentalId === 'rental-2');
      expect(rental2).toBeDefined();
      expect(rental2?.archived).toBe(true);
    });

    it('should delete conversations entirely', async () => {
      const freshRepo = new MockMessagesRepository();
      await freshRepo.deleteConversations(['rental-2']);
      const conversations = await freshRepo.getConversations('user-1');
      expect(conversations.find((c) => c.rentalId === 'rental-2')).toBeUndefined();
    });

    it('should mark conversations as unread', async () => {
      const freshRepo = new MockMessagesRepository();
      const before = await freshRepo.getConversations('user-1');
      expect(before.find((c) => c.rentalId === 'rental-1')?.unreadCount).toBe(0);
      await freshRepo.markConversationsUnread(['rental-1'], 'user-1');
      const after = await freshRepo.getConversations('user-1');
      expect(after.find((c) => c.rentalId === 'rental-1')?.unreadCount).toBeGreaterThan(0);
    });

    it('should unarchive conversations back into All/Unread', async () => {
      const freshRepo = new MockMessagesRepository();
      await freshRepo.archiveConversations(['rental-2']);
      await freshRepo.unarchiveConversations(['rental-2']);
      const conversations = await freshRepo.getConversations('user-1');
      expect(conversations.find((c) => c.rentalId === 'rental-2')?.archived).toBe(false);
    });

    it('should mark conversations as read', async () => {
      const freshRepo = new MockMessagesRepository();
      const before = await freshRepo.getConversations('user-1');
      expect(before.find((c) => c.rentalId === 'rental-2')?.unreadCount).toBeGreaterThan(0);
      await freshRepo.markConversationsRead(['rental-2'], 'user-1');
      const after = await freshRepo.getConversations('user-1');
      expect(after.find((c) => c.rentalId === 'rental-2')?.unreadCount).toBe(0);
    });
  });

  describe('MockProfilesRepository', () => {
    const repo = new MockProfilesRepository();

    it('should return profile', async () => {
      const profile = await repo.getProfile('user-1');
      expect(profile).not.toBeNull();
      expect(profile?.fullName).toBeDefined();
    });

    it('should update profile', async () => {
      const updated = await repo.updateProfile('user-1', {
        bio: 'Updated bio',
      });
      expect(updated.bio).toBe('Updated bio');
    });
  });
});
