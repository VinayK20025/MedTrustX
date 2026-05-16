'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { NotificationSettings } from '@/modules/user';
import { useUserSettings, useUpdateNotifications } from '@/modules/user';
import { cn } from '@/utils/cn';
import { AlertTriangle, BellRing, CheckCircle2, Clock3, RefreshCw, Search, ShieldAlert, ServerCog, Mail, Smartphone, Inbox, ArrowRight, Layers3 } from 'lucide-react';
import { useNotificationsInbox, useUnreadNotificationsCount, useMarkNotificationRead, useNotificationPreferences } from '../hooks/useNotificationsAnalytics';
import type { NotificationCenterModeConfig, NotificationFilterState, NotificationRecord, NotificationSeverity, NotificationStatus } from '../types/notifications.types';

const MODE_CONFIG: Record<'sre' | 'it-ops', NotificationCenterModeConfig> = {
  sre: {
    title: 'SRE Notifications',
    subtitle: 'Incident-facing alerts, escalation signals, and delivery health for the platform notification service.',
    breadcrumb: 'Reliability Engineering',
    focusLabel: 'Reliability Feed',
    focusDescription: 'Track high-severity alerts, delivery latency, and routing health for operational response.',
  },
  'it-ops': {
    title: 'IT Ops Notifications',
    subtitle: 'Subscription management, delivery preferences, and notification routing controls for enterprise operations.',
    breadcrumb: 'IT Governance',
    focusLabel: 'Delivery Controls',
    focusDescription: 'Tune channel preferences, review notification intake, and verify routing coverage.',
  },
};

const SEVERITY_OPTIONS = [
  { label: 'All severities', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Success', value: 'success' },
  { label: 'Info', value: 'info' },
];

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Suppressed', value: 'suppressed' },
];

const severityStyles: Record<NotificationSeverity, string> = {
  critical: 'border-emergency/20 bg-emergency/10 text-emergency-light',
  warning: 'border-warning/20 bg-warning/10 text-warning-light',
  success: 'border-success/20 bg-success/10 text-success-light',
  info: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
};

const statusStyles: Record<NotificationStatus, string> = {
  unread: 'text-warning-light',
  read: 'text-gray-400',
  resolved: 'text-success-light',
  suppressed: 'text-gray-500',
};

function unwrapListPayload(payload: any): any[] {
  const root = payload?.data ?? payload?.items ?? payload?.results ?? payload?.notifications ?? payload;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;
  return [];
}

function unwrapNumericPayload(payload: any): number {
  const root = payload?.data ?? payload;
  if (typeof root === 'number') return root;
  if (typeof root?.count === 'number') return root.count;
  if (typeof root?.unreadCount === 'number') return root.unreadCount;
  if (typeof root?.value === 'number') return root.value;
  return 0;
}

function normalizeRecord(record: any): NotificationRecord {
  const status = (record?.status ?? (record?.read ? 'read' : 'unread')) as NotificationStatus;
  const severity = (record?.severity ?? record?.priority ?? 'info') as NotificationSeverity;
  return {
    id: String(record?.id ?? record?._id ?? `${record?.createdAt ?? Date.now()}`),
    title: record?.title ?? record?.subject ?? record?.event ?? 'Notification',
    message: record?.message ?? record?.body ?? record?.description ?? '',
    severity: ['critical', 'warning', 'success', 'info'].includes(severity) ? severity : 'info',
    category: record?.category ?? record?.type ?? 'general',
    status: ['unread', 'read', 'resolved', 'suppressed'].includes(status) ? status : 'unread',
    source: record?.source ?? record?.service ?? record?.origin ?? 'notification-service',
    channel: record?.channel,
    audience: record?.audience,
    recipient: record?.recipient,
    createdAt: record?.createdAt ?? record?.timestamp ?? new Date().toISOString(),
    readAt: record?.readAt,
    tags: Array.isArray(record?.tags) ? record.tags : [],
  };
}

function severityRank(severity: NotificationSeverity): number {
  return { critical: 4, warning: 3, success: 2, info: 1 }[severity];
}

function buildQueryParams(mode: 'sre' | 'it-ops', filters: NotificationFilterState) {
  return {
    scope: mode,
    severity: filters.severity === 'all' ? undefined : filters.severity,
    status: filters.status === 'all' ? undefined : filters.status,
    q: filters.search.trim() || undefined,
    limit: 100,
  };
}

function NotificationStat({ label, value, delta, icon, tone }: { label: string; value: string | number; delta?: string; icon: React.ReactNode; tone: 'critical' | 'warning' | 'success' | 'info' }) {
  const toneStyles: Record<typeof tone, string> = {
    critical: 'border-emergency/20 bg-emergency/5 text-emergency-light',
    warning: 'border-warning/20 bg-warning/5 text-warning-light',
    success: 'border-success/20 bg-success/5 text-success-light',
    info: 'border-sky-500/20 bg-sky-500/5 text-sky-400',
  };

  return (
    <Card className={cn('border-white/[0.06] shadow-glass bg-surface-light', toneStyles[tone])}>
      <CardBody className="p-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
          <p className="text-3xl font-black text-white mt-2">{value}</p>
          {delta && <p className="text-xs text-gray-500 mt-1">{delta}</p>}
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-current">{icon}</div>
      </CardBody>
    </Card>
  );
}

function NotificationRow({ item, onRead, loading }: { item: NotificationRecord; onRead: (id: string) => void; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border', severityStyles[item.severity])}>{item.severity}</span>
            <span className={cn('text-[10px] uppercase tracking-widest font-bold', statusStyles[item.status])}>{item.status}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{item.category}</span>
          </div>
          <p className="font-semibold text-white truncate">{item.title}</p>
          {item.message && <p className="text-sm text-gray-400 line-clamp-2">{item.message}</p>}
        </div>
        <div className="text-[10px] text-gray-500 text-right shrink-0">
          <div>{new Date(item.createdAt).toLocaleString()}</div>
          <div className="mt-1">{item.source}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2 flex-wrap">
          {item.channel && <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1"><ServerCog className="w-3 h-3" /> {item.channel}</span>}
          {item.recipient && <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1"><Inbox className="w-3 h-3" /> {item.recipient}</span>}
          {item.tags?.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2 py-1">{tag}</span>)}
        </div>
        {item.status !== 'read' && (
          <Button size="sm" variant="outline" loading={loading} onClick={() => onRead(item.id)} className="shrink-0">
            Mark Read
          </Button>
        )}
      </div>
    </div>
  );
}

export function NotificationsConsole({ mode }: { mode: 'sre' | 'it-ops' }) {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const config = MODE_CONFIG[mode];
  const [filters, setFilters] = useState<NotificationFilterState>({ search: '', severity: 'all', status: 'all' });

  const inboxQuery = useNotificationsInbox(buildQueryParams(mode, filters));
  const unreadQuery = useUnreadNotificationsCount();
  const preferencesQuery = useNotificationPreferences();
  const { data: settingsData, isLoading: settingsLoading } = useUserSettings();
  const updateNotifications = useUpdateNotifications();
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    setPageMeta(config.title, config.subtitle);
  }, [config.subtitle, config.title, setPageMeta]);

  const records = useMemo(
    () => unwrapListPayload(inboxQuery.data).map(normalizeRecord),
    [inboxQuery.data],
  );

  const unreadCount = unwrapNumericPayload(unreadQuery.data);
  const preferences = preferencesQuery.data?.data;
  const userNotificationPreferences = settingsData?.data?.notifications;

  const filteredRecords = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return records
      .filter((item) => (filters.severity === 'all' ? true : item.severity === filters.severity))
      .filter((item) => (filters.status === 'all' ? true : item.status === filters.status))
      .filter((item) => (q ? [item.title, item.message, item.category, item.source, item.recipient].filter(Boolean).join(' ').toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const rank = severityRank(b.severity) - severityRank(a.severity);
        return rank !== 0 ? rank : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [filters.search, filters.severity, filters.status, records]);

  const criticalCount = filteredRecords.filter((item) => item.severity === 'critical').length;
  const readCount = filteredRecords.filter((item) => item.status === 'read').length;
  const emailEnabled = preferences?.channels?.email ? 'Enabled' : 'Disabled';
  const smsEnabled = preferences?.channels?.sms ? 'Enabled' : 'Disabled';
  const inAppEnabled = preferences?.channels?.inApp ? 'Enabled' : 'Disabled';

  const markVisibleRead = async () => {
    const unreadVisible = filteredRecords.filter((item) => item.status !== 'read');
    await Promise.allSettled(unreadVisible.map((item) => markRead.mutateAsync(item.id)));
  };

  if (inboxQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-[720px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <Breadcrumbs items={[{ label: config.breadcrumb }, { label: 'Notifications' }]} />
        <div className="flex items-center gap-2 text-sm font-bold text-sky-400 bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/25">
          <BellRing className="w-4 h-4" /> Notification Service Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <NotificationStat label="Unread" value={unreadCount} delta={`${readCount} visible read`} icon={<AlertTriangle className="w-4 h-4" />} tone="warning" />
        <NotificationStat label="Critical" value={criticalCount} delta={`${filteredRecords.length} visible messages`} icon={<ShieldAlert className="w-4 h-4" />} tone="critical" />
        <NotificationStat label="Resolved" value={filteredRecords.filter((item) => item.status === 'resolved').length} delta={config.focusLabel} icon={<CheckCircle2 className="w-4 h-4" />} tone="success" />
        <NotificationStat label="Delivery" value="Live" delta={`${inAppEnabled} in-app, ${emailEnabled.toLowerCase()} email, ${smsEnabled.toLowerCase()} sms`} icon={<Layers3 className="w-4 h-4" />} tone="info" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 flex flex-col gap-5">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Inbox</h3>
                <p className="text-xs text-gray-400 mt-0.5">{config.focusDescription}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    value={filters.search}
                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                    placeholder="Search notifications"
                    className="pl-10"
                  />
                </div>
                <Select
                  value={filters.severity}
                  onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value as NotificationFilterState['severity'] }))}
                  options={SEVERITY_OPTIONS}
                  className="md:w-44"
                />
                <Select
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as NotificationFilterState['status'] }))}
                  options={STATUS_OPTIONS}
                  className="md:w-44"
                />
                <Button variant="outline" onClick={() => void inboxQuery.refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Refresh
                </Button>
                <Button variant="secondary" onClick={() => void markVisibleRead()} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Mark Visible Read
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3 max-h-[760px] overflow-y-auto">
              {filteredRecords.length === 0 ? (
                <div className="py-20 text-center text-gray-500">No notifications match the current filters.</div>
              ) : (
                filteredRecords.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    loading={markRead.isPending}
                    onRead={(id) => markRead.mutate(id)}
                  />
                ))
              )}
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardBody className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Active sources</p>
                <p className="text-3xl font-black text-white mt-2">{new Set(filteredRecords.map((item) => item.source)).size}</p>
                <p className="text-xs text-gray-500 mt-1">Upstream service and event origins</p>
              </CardBody>
            </Card>
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardBody className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Unread ratio</p>
                <p className="text-3xl font-black text-warning-light mt-2">{filteredRecords.length ? Math.round(((filteredRecords.length - readCount) / filteredRecords.length) * 100) : 0}%</p>
                <p className="text-xs text-gray-500 mt-1">Visible items in the current slice</p>
              </CardBody>
            </Card>
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardBody className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Last refresh</p>
                <p className="text-3xl font-black text-sky-400 mt-2">Live</p>
                <p className="text-xs text-gray-500 mt-1">Polling enabled for service updates</p>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-5">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">{config.focusLabel}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{config.focusDescription}</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-gray-300">
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start gap-3">
                <ServerCog className="w-4 h-4 text-sky-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Service routing</p>
                  <p className="text-gray-400 mt-1">{mode === 'sre' ? 'Optimize escalations and service alerts into the incident queue.' : 'Manage enterprise notification subscriptions and delivery paths.'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Delivery coverage</p>
                  <p className="text-gray-400 mt-1">{preferences?.channels?.inApp ? 'In-app notifications are enabled.' : 'In-app notifications are disabled.'} {preferences?.channels?.email ? 'Email routing is enabled.' : 'Email routing is disabled.'} {preferences?.channels?.sms ? 'SMS alerts are enabled for critical events.' : 'SMS alerts are disabled.'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Unread count</p>
                  <p className="text-gray-400 mt-1">{unreadCount} pending notifications across the selected scope.</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {mode === 'it-ops' ? (
            <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Preference Controls</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Reuse the existing role-aware notification settings model.</p>
                </div>
              </CardHeader>
              <CardBody>
                {settingsLoading || !userNotificationPreferences ? (
                  <Skeleton className="h-[580px] w-full rounded-xl" />
                ) : (
                  <NotificationSettings
                    preferences={userNotificationPreferences}
                    onUpdate={(data) => updateNotifications.mutate(data)}
                    saving={updateNotifications.isPending}
                  />
                )}
              </CardBody>
            </Card>
          ) : (
            <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Operational Routing</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Observability and incident workflow around the notification stream.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 text-sm text-gray-300">
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start gap-3">
                  <Clock3 className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Polling window</p>
                    <p className="text-gray-400 mt-1">Service inbox refreshes every 20 seconds, with unread counts updated every 15 seconds.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Critical path</p>
                    <p className="text-gray-400 mt-1">Use the severity filter to isolate paging-worthy alerts and route them to the incident deck.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Service contract</p>
                    <p className="text-gray-400 mt-1">Notifications are consumed through the shared API layer and surfaced in-app through the existing toast bridge.</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
