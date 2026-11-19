import type { Profile } from '../types/profile';

/**
 * Trust badges shown on the Account tab and public profile pages.
 * Single source of truth so both screens stay consistent.
 *
 * Verification is conveyed by the blue tick beside the name, so only
 * earned distinctions appear as badges:
 * - "Super Host" — active owner with 10+ rentals rated 4.5★ or better.
 */
export function getProfileTrustBadges(profile: Profile): string[] {
  const badges: string[] = [];
  if (
    profile.isOwner &&
    (profile.ratingCount ?? 0) >= 10 &&
    (profile.ratingAverage ?? 0) >= 4.5
  ) {
    badges.push('Super Host');
  }
  return badges;
}

/** Display handle derived from the display name (e.g. "Alex Morgan" → "alex.morgan"). */
export function profileUsername(profile: Pick<Profile, 'fullName'>): string {
  const name = profile.fullName?.trim();
  return (name && name.length > 0 ? name : 'member')
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
}
