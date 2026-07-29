import { isMockDataEnabled } from '../constants/env';
import { MockListingsRepository, SupabaseListingsRepository } from './ListingsRepository';
import { MockRentalsRepository, SupabaseRentalsRepository } from './RentalsRepository';
import { MockMessagesRepository, SupabaseMessagesRepository } from './MessagesRepository';
import { MockProfilesRepository, SupabaseProfilesRepository } from './ProfilesRepository';
import type { ListingsRepository } from './ListingsRepository';
import type { RentalsRepository } from './RentalsRepository';
import type { MessagesRepository } from './MessagesRepository';
import type { ProfilesRepository } from './ProfilesRepository';

interface Repositories {
  listings: ListingsRepository;
  rentals: RentalsRepository;
  messages: MessagesRepository;
  profiles: ProfilesRepository;
}

let repositories: Repositories | null = null;

export function getRepositories(): Repositories {
  if (!repositories) {
    if (isMockDataEnabled()) {
      repositories = {
        listings: new MockListingsRepository(),
        rentals: new MockRentalsRepository(),
        messages: new MockMessagesRepository(),
        profiles: new MockProfilesRepository(),
      };
    } else {
      repositories = {
        listings: new SupabaseListingsRepository(),
        rentals: new SupabaseRentalsRepository(),
        messages: new SupabaseMessagesRepository(),
        profiles: new SupabaseProfilesRepository(),
      };
    }
  }
  return repositories;
}

export type { ListingsRepository, RentalsRepository, MessagesRepository, ProfilesRepository };
