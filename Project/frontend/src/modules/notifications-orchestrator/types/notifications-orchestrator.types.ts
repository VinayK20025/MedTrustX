/**
 * MedTrustX — Notifications Orchestrator Types
 * Consolidates integration routing, delivery policy, and notification inbox telemetry.
 */

import type { IntegrationData, IntegrationInterface, IntegrationMessage, RoutingRule } from '@/modules/integration-engineer';
import type { NotificationRecord, NotificationFilterState } from '@/modules/notifications';
import type { NotificationPreferences } from '@/modules/user/types/user.types';

export interface NotificationDeliveryChannel {
  id: string;
  name: string;
  type: 'inApp' | 'email' | 'sms' | 'webhook' | 'pager';
  enabled: boolean;
  destination: string;
  latencyMs: number;
  successRate: number;
  lastDeliveredAt?: string;
}

export interface NotificationOrchestratorSummary {
  integration: IntegrationData;
  notifications: NotificationRecord[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  channels: NotificationDeliveryChannel[];
  activeRoutes: RoutingRule[];
  criticalMessages: IntegrationMessage[];
  degradedInterfaces: IntegrationInterface[];
  filters: NotificationFilterState;
}

export interface NotificationOrchestratorFilters {
  search: string;
  severity: 'all' | 'info' | 'success' | 'warning' | 'critical';
  status: 'all' | 'unread' | 'read' | 'resolved' | 'suppressed';
}
