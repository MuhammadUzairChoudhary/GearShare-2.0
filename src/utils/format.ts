export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Compact date for summary cards (e.g. "Aug 15"). */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Compact rental date range.
 *
 * When both dates fall in the same calendar month the month is written once:
 *   "Aug 1-2"  (never "Aug 1 – Aug 2")
 * A single-day range collapses to one date ("Aug 1"), and ranges that cross
 * a month boundary keep both months ("Aug 15 – Sep 2").
 * Accepts ISO strings (rental.startDate/endDate) or Date objects (calendar).
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const startLabel = Number.isNaN(start.getTime()) ? String(startDate) : fmt(start);
    const endLabel = Number.isNaN(end.getTime()) ? String(endDate) : fmt(end);
    return `${startLabel} – ${endLabel}`;
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  if (sameDay) return fmt(start);

  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) return `${fmt(start)}-${end.getDate()}`;

  return `${fmt(start)} – ${fmt(end)}`;
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Clock time for message bubbles (e.g. "2:41 PM"). */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Day separator for conversation threads: "Today", "Yesterday",
 * or a readable date ("Wed, Aug 5" — year added when it differs).
 */
export function formatDayDivider(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(date);
  that.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - that.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(
    'en-US',
    sameYear
      ? { weekday: 'short', month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' },
  );
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

/**
 * Presence readout for chat headers.
 * - Active within 2 minutes → "Online"
 * - Otherwise → "Last online · N min/hrs ago", "Yesterday", or a short date.
 * Returns null when there is no presence data (subtitle is hidden).
 * `now` is injectable for deterministic tests.
 */
export function formatPresence(
  lastActiveAt: string | null | undefined,
  now: number = Date.now(),
): { label: string; isOnline: boolean } | null {
  if (!lastActiveAt) return null;
  const last = new Date(lastActiveAt).getTime();
  if (Number.isNaN(last)) return null;

  const diffMs = now - last;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 2) return { label: 'Online', isOnline: true };
  if (diffMinutes < 60) return { label: `Last online · ${diffMinutes} min ago`, isOnline: false };

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return { label: `Last online · ${diffHours} hr ago`, isOnline: false };

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const that = new Date(last);
  that.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - that.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return { label: 'Last online · Yesterday', isOnline: false };

  return { label: `Last online · ${formatShortDate(lastActiveAt)}`, isOnline: false };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
