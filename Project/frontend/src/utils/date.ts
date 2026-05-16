/**
 * MedTrustX — Date Utilities
 * Wraps date-fns for consistent date handling across the app.
 */
import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isYesterday,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  isValid,
} from 'date-fns';

/** Format ISO date to readable string */
export function formatDate(date: string | Date, pattern = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, pattern);
}

/** Format date with time */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
}

/** Format time only */
export function formatTime(date: string | Date): string {
  return formatDate(date, 'HH:mm');
}

/** Human-readable relative time: "2 hours ago" */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Smart date display: "Today", "Yesterday", or full date */
export function smartDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  if (isToday(d)) return `Today, ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'HH:mm')}`;
  return format(d, 'dd MMM yyyy, HH:mm');
}

/** Duration in human-readable form */
export function formatDuration(startDate: string | Date, endDate: string | Date): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  const minutes = differenceInMinutes(end, start);
  if (minutes < 60) return `${minutes}m`;

  const hours = differenceInHours(end, start);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;

  const days = differenceInDays(end, start);
  return `${days}d ${hours % 24}h`;
}

/** Check if a date is within a range */
export function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

/* Re-export commonly used date-fns utilities */
export {
  parseISO,
  isToday,
  isYesterday,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  isValid,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
};
