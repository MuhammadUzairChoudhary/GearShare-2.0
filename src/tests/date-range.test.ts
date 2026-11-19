import { formatDateRange } from '../utils/format';

describe('formatDateRange', () => {
  it('writes the month once when both dates fall in the same month', () => {
    expect(formatDateRange('2026-08-01T00:00:00', '2026-08-02T00:00:00')).toBe('Aug 1-2');
  });

  it('keeps a multi-day span within one month compact', () => {
    expect(formatDateRange('2026-08-15T00:00:00', '2026-08-18T00:00:00')).toBe('Aug 15-18');
  });

  it('collapses a single-day range to one date', () => {
    expect(formatDateRange('2026-08-15T00:00:00', '2026-08-15T00:00:00')).toBe('Aug 15');
  });

  it('keeps both months when the range crosses a month boundary', () => {
    expect(formatDateRange('2026-08-30T00:00:00', '2026-09-02T00:00:00')).toBe(
      'Aug 30 – Sep 2',
    );
  });

  it('keeps both months when the range spans across years', () => {
    expect(formatDateRange('2026-12-29T00:00:00', '2027-01-03T00:00:00')).toBe(
      'Dec 29 – Jan 3',
    );
  });

  it('accepts Date objects as well as strings', () => {
    expect(
      formatDateRange(new Date(2026, 7, 1, 12), new Date(2026, 7, 4, 12)),
    ).toBe('Aug 1-4');
  });

  it('falls back to the raw values for invalid dates', () => {
    expect(formatDateRange('not-a-date', '2026-08-02T00:00:00')).toBe(
      'not-a-date – Aug 2',
    );
  });
});
