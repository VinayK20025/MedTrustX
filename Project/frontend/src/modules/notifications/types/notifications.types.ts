/**
 * MedTrustX — Notifications Center Types
 * Shared routing, inbox, and delivery metadata for platform notifications.
 */

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';
export type NotificationStatus = 'unread' | 'read' | 'resolved' | 'suppressed';

export interface NotificationRecord {
  id: string;
  title: string;
  message?: string;
  severity: NotificationSeverity;
  category: string;
  status: NotificationStatus;
  source: string;
  channel?: 'inApp' | 'email' | 'sms' | 'webhook' | string;
  audience?: string;
  recipient?: string;
  createdAt: string;
  readAt?: string;
  tags?: string[];
}

export interface NotificationFilterState {
  search: string;
  severity: 'all' | NotificationSeverity;
  status: 'all' | NotificationStatus;
}

export interface NotificationCenterModeConfig {
  title: string;
  subtitle: string;
  breadcrumb: string;
  focusLabel: string;
  focusDescription: string;
}
