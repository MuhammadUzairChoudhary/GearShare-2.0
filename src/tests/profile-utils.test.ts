import { getProfileTrustBadges, profileUsername } from '../utils/profile';
import type { Profile } from '../types/profile';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-x',
    fullName: 'Test User',
    avatarUrl: null,
    location: null,
    bio: null,
    isRenter: true,
    isOwner: false,
    verificationStatus: 'unverified',
    ratingAverage: null,
    ratingCount: 0,
    lastActiveAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('getProfileTrustBadges', () => {
  it('does not badge verification alone — the blue tick conveys it', () => {
    expect(getProfileTrustBadges(makeProfile({ verificationStatus: 'verified' }))).toEqual([]);
  });

  it('returns Super Host only for seasoned owners (10+ reviews, 4.5★+)', () => {
    const base = {
      isOwner: true,
      ratingCount: 12,
      ratingAverage: 4.7,
    };
    expect(getProfileTrustBadges(makeProfile(base))).toEqual(['Super Host']);
  });

  it('awards Super Host to seasoned verified owners', () => {
    const profile = makeProfile({
      verificationStatus: 'verified',
      isOwner: true,
      ratingCount: 24,
      ratingAverage: 4.8,
    });
    expect(getProfileTrustBadges(profile)).toEqual(['Super Host']);
  });

  it('does not award Super Host to low-volume or low-rated owners', () => {
    expect(
      getProfileTrustBadges(makeProfile({ isOwner: true, ratingCount: 9, ratingAverage: 4.8 })),
    ).toEqual([]);
    expect(
      getProfileTrustBadges(makeProfile({ isOwner: true, ratingCount: 20, ratingAverage: 4.4 })),
    ).toEqual([]);
  });

  it('returns no badges for unverified renters', () => {
    expect(getProfileTrustBadges(makeProfile())).toEqual([]);
  });
});

describe('profileUsername', () => {
  it('derives a dot-separated handle from the display name', () => {
    expect(profileUsername(makeProfile({ fullName: 'Alex Morgan' }))).toBe('alex.morgan');
  });

  it('strips non-alphanumeric characters', () => {
    expect(profileUsername(makeProfile({ fullName: "O'Brien-Smith" }))).toBe('obriensmith');
  });

  it('falls back for missing names', () => {
    expect(profileUsername({ fullName: '' })).toBe('member');
  });
});
