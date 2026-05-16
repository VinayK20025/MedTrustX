/**
 * MedTrustX — Formatting Utilities
 */

/** Format number with locale-aware separators */
export function formatNumber(value: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Format currency (INR default for Indian healthcare) */
export function formatCurrency(value: number, currency = 'INR', locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format percentage */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format file size */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Truncate string with ellipsis */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

/** Format patient MRN (Medical Record Number) */
export function formatMRN(mrn: string): string {
  return mrn.startsWith('MRN-') ? mrn : `MRN-${mrn}`;
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Title case */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Generate initials from full name */
export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, maxChars)
    .join('')
    .toUpperCase();
}

/** Mask sensitive data */
export function maskData(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value;
  return '•'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

/** Format phone number (Indian format) */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
