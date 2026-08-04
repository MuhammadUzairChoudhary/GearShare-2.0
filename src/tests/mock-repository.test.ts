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
      const conversations = await repo.getConversations('user-1');
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
