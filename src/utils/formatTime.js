/**
 * Lightweight relative time formatter.
 * Returns strings like "just now", "2m ago", "1h ago", "3d ago".
 */
export function formatDistanceToNow(date) {
  if (!date) return '';
  const now = Date.now();
  const diffMs = now - (date instanceof Date ? date.getTime() : date);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return 'just now';
  if (diffMin < 1) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date instanceof Date
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';
}

/**
 * Formats a Date to a short time string, e.g. "3:45 PM"
 */
export function formatTime(date) {
  if (!date) return '';
  return (date instanceof Date ? date : new Date(date)).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
