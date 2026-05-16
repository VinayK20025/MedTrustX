import { apiPatch } from '@/services/api';
import { integrationApi } from '@/modules/integration-engineer';
import { notificationsApi } from '@/modules/notifications';
import type { NotificationPreferences } from '@/modules/user/types/user.types';
import type { NotificationRecord } from '@/modules/notifications';
import type { NotificationOrchestratorSummary, NotificationDeliveryChannel } from '../types/notifications-orchestrator.types';

export interface OrchestratorFilters {
  search?: string;
  severity?: string;
  status?: string;
}

function unwrapItems(payload: any): any[] {
  const root = payload?.data ?? payload?.items ?? payload?.results ?? payload;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.notifications)) return root.notifications;
  return [];
}

function unwrapSingle<T>(payload: any): T | null {
  if (!payload) return null;
  return (payload.data ?? payload) as T;
}

function normalizeNotification(record: any): NotificationRecord {
  const severity = ['critical', 'warning', 'success', 'info'].includes((record?.severity ?? record?.priority ?? 'info').toLowerCase())
    ? (record?.severity ?? record?.priority ?? 'info').toLowerCase()
    : 'info';
  const rawStatus = (record?.status ?? (record?.read ? 'read' : 'unread') ?? 'unread').toLowerCase();
  const status = ['unread', 'read', 'resolved', 'suppressed'].includes(rawStatus) ? rawStatus : 'unread';

  return {
    id: String(record?.id ?? record?._id ?? `${record?.createdAt ?? Date.now()}`),
    title: record?.title ?? record?.subject ?? 'Notification',
    message: record?.message ?? record?.body ?? record?.description ?? '',
    severity: severity as NotificationRecord['severity'],
    category: record?.category ?? record?.type ?? 'general',
    status: status as NotificationRecord['status'],
    source: record?.source ?? record?.service ?? record?.origin ?? 'notification-service',
    channel: record?.channel,
    audience: record?.audience,
    recipient: record?.recipient,
    createdAt: record?.createdAt ?? record?.timestamp ?? new Date().toISOString(),
    readAt: record?.readAt,
    tags: Array.isArray(record?.tags) ? record.tags : [],
  };
}

function buildNotificationChannels(preferences: NotificationPreferences | null): NotificationDeliveryChannel[] {
  return [
    {
      id: 'inapp',
      name: 'In-App Stream',
      type: 'inApp',
      enabled: preferences?.channels?.inApp ?? true,
      destination: 'MedTrustX UI + toast bridge',
      latencyMs: 35,
      successRate: 99.98,
      lastDeliveredAt: new Date(Date.now() - 90_000).toISOString(),
    },
    {
      id: 'email',
      name: 'Email Relay',
      type: 'email',
      enabled: preferences?.channels?.email ?? true,
      destination: 'SMTP relay and outbound mail queue',
      latencyMs: 210,
      successRate: 99.7,
      lastDeliveredAt: new Date(Date.now() - 180_000).toISOString(),
    },
    {
      id: 'sms',
      name: 'SMS Escalation',
      type: 'sms',
      enabled: preferences?.channels?.sms ?? true,
      destination: 'Critical alert SMS gateway',
      latencyMs: 420,
      successRate: 99.3,
      lastDeliveredAt: new Date(Date.now() - 240_000).toISOString(),
    },
    {
      id: 'webhook',
      name: 'Webhook Fan-out',
      type: 'webhook',
      enabled: true,
      destination: 'Integration broker / downstream consumers',
      latencyMs: 52,
      successRate: 99.86,
      lastDeliveredAt: new Date(Date.now() - 60_000).toISOString(),
    },
    {
      id: 'pager',
      name: 'PagerDuty Bridge',
      type: 'pager',
      enabled: true,
      destination: 'Pager escalation and on-call routing',
      latencyMs: 18,
      successRate: 99.92,
      lastDeliveredAt: new Date(Date.now() - 30_000).toISOString(),
    },
  ];
}

export const notificationsOrchestratorApi = {
  getDashboardData: async (filters: OrchestratorFilters = {}): Promise<{ data: NotificationOrchestratorSummary; message: string; status: number }> => {
    const [integrationRes, inboxRes, unreadRes, prefsRes] = await Promise.allSettled([
      integrationApi.getDashboardData(),
      notificationsApi.list({
        unread: filters.status === 'unread' ? true : undefined,
        severity: filters.severity,
        status: filters.status,
        q: filters.search,
        limit: 100,
      }),
      notificationsApi.unreadCount(),
      notificationsApi.preferences(),
    ]);

    const integration = integrationRes.status === 'fulfilled' ? integrationRes.value.data : null;
    const notifications = inboxRes.status === 'fulfilled' ? unwrapItems(inboxRes.value).map(normalizeNotification) : [];
    const unreadCount = unreadRes.status === 'fulfilled' ? Number(unwrapSingle<any>(unreadRes.value)?.count ?? unwrapSingle<any>(unreadRes.value)?.unreadCount ?? 0) : notifications.filter((item) => item.status === 'unread').length;
    const preferences = prefsRes.status === 'fulfilled' ? unwrapSingle<NotificationPreferences>(prefsRes.value) : null;

    if (!integration) {
      return {
        data: {
          integration: await integrationApi.getDashboardData().then((response) => response.data),
          notifications,
          unreadCount,
          preferences,
          channels: buildNotificationChannels(preferences),
          activeRoutes: [],
          criticalMessages: [],
          degradedInterfaces: [],
          filters: {
            search: filters.search ?? '',
            severity: (filters.severity as any) ?? 'all',
            status: (filters.status as any) ?? 'all',
          },
        },
        message: 'Success',
        status: 200,
      };
    }

    const criticalMessages = integration.messages.filter((message) => message.status === 'Failed' || message.status === 'Reprocessing');
    const degradedInterfaces = integration.interfaces.filter((item) => item.status !== 'Active');

    return {
      data: {
        integration,
        notifications,
        unreadCount,
        preferences,
        channels: buildNotificationChannels(preferences),
        activeRoutes: integration.routing.filter((route) => route.active),
        criticalMessages,
        degradedInterfaces,
        filters: {
          search: filters.search ?? '',
          severity: (filters.severity as any) ?? 'all',
          status: (filters.status as any) ?? 'all',
        },
      },
      message: 'Success',
      status: 200,
    };
  },

  retryMessage: async (id: string) => notificationsOrchestratorApiIntegration.retryMessage(id),
  discardMessage: async (id: string) => notificationsOrchestratorApiIntegration.discardMessage(id),
  toggleRoute: async (id: string, active: boolean) => notificationsOrchestratorApiIntegration.toggleRoute(id, active),
  markRead: async (id: string) => notificationsApi.markRead(id),
  updatePreferences: async (data: Partial<NotificationPreferences>) => notificationsApi.updatePreferences(data),
};

const notificationsOrchestratorApiIntegration = integrationApi;
