import type { Profile, ProfileUpdateInput } from '../types/profile';
import { mockProfile, mockProfiles } from '../mocks/data';

export interface ProfilesRepository {
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, input: ProfileUpdateInput): Promise<Profile>;
}

export class MockProfilesRepository implements ProfilesRepository {
  private profile: Profile = { ...mockProfile };

  async getProfile(userId: string): Promise<Profile | null> {
    // The signed-in user's profile is the mutable instance (updates apply to
    // it). Any other id resolves against the mock directory so public profile
    // pages show the right person — never the signed-in user's data.
    if (userId === this.profile.id) return this.profile;
    return mockProfiles.find((p) => p.id === userId) ?? null;
  }

  async updateProfile(_userId: string, input: ProfileUpdateInput): Promise<Profile> {
    this.profile = { ...this.profile, ...input, updatedAt: new Date().toISOString() };
    return this.profile;
  }
}

export class SupabaseProfilesRepository implements ProfilesRepository {
  async getProfile(_userId: string): Promise<Profile | null> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async updateProfile(_userId: string, _input: ProfileUpdateInput): Promise<Profile> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }
}
