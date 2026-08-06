import { formatDayDivider } from '../utils/format';

describe('formatDayDivider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-05T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('labels today', () => {
    expect(formatDayDivider('2026-08-05T09:30:00')).toBe('Today');
  });

  it('labels yesterday', () => {
    expect(formatDayDivider('2026-08-04T23:59:00')).toBe('Yesterday');
  });

  it('formats older dates within the same year', () => {
    expect(formatDayDivider('2026-07-20T08:00:00')).toBe('Mon, Jul 20');
  });

  it('includes the year when it differs from the current year', () => {
    expect(formatDayDivider('2025-12-31T08:00:00')).toBe('Dec 31, 2025');
  });

  it('returns empty string for invalid dates', () => {
    expect(formatDayDivider('not-a-date')).toBe('');
  });
});
