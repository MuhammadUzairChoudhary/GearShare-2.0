import { formatPresence } from '../utils/format';

// Fixed reference time so the tests never depend on the wall clock.
const NOW = new Date('2026-08-05T12:00:00Z').getTime();
const isoAgo = (ms: number) => new Date(NOW - ms).toISOString();

describe('formatPresence', () => {
  it('shows Online when active within the last 2 minutes', () => {
    expect(formatPresence(isoAgo(30 * 1000), NOW)).toEqual({
      label: 'Online',
      isOnline: true,
    });
    expect(formatPresence(isoAgo(90 * 1000), NOW)).toEqual({
      label: 'Online',
      isOnline: true,
    });
  });

  it('shows minutes since last activity under an hour', () => {
    expect(formatPresence(isoAgo(3 * 60 * 1000), NOW)).toEqual({
      label: 'Last online · 3 min ago',
      isOnline: false,
    });
    expect(formatPresence(isoAgo(59 * 60 * 1000), NOW)).toEqual({
      label: 'Last online · 59 min ago',
      isOnline: false,
    });
  });

  it('shows hours since last activity under a day', () => {
    expect(formatPresence(isoAgo(2 * 3600 * 1000), NOW)).toEqual({
      label: 'Last online · 2 hr ago',
      isOnline: false,
    });
    expect(formatPresence(isoAgo(23 * 3600 * 1000), NOW)).toEqual({
      label: 'Last online · 23 hr ago',
      isOnline: false,
    });
  });

  it('shows Yesterday for the previous calendar day', () => {
    expect(formatPresence(isoAgo(26 * 3600 * 1000), NOW)).toEqual({
      label: 'Last online · Yesterday',
      isOnline: false,
    });
  });

  it('shows a short date for older activity', () => {
    expect(formatPresence(isoAgo(6 * 86400 * 1000), NOW)).toEqual({
      label: 'Last online · Jul 30',
      isOnline: false,
    });
  });

  it('returns null when there is no presence data', () => {
    expect(formatPresence(null, NOW)).toBeNull();
    expect(formatPresence(undefined, NOW)).toBeNull();
  });
});
