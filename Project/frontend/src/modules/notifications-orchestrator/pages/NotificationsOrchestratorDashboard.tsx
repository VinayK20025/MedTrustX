'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { NotificationSettings } from '@/modules/user';
import { cn } from '@/utils/cn';
import { AlertTriangle, BellRing, CheckCircle2, Clock3, GitMerge, Inbox, RefreshCw, Search, ServerCog, ShieldAlert, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import {
  useDiscardOrchestratorMessage,
  useMarkOrchestratorNotificationRead,
  useNotificationsOrchestratorDashboard,
  useRetryOrchestratorMessage,
  useToggleOrchestratorRoute,
  useUpdateOrchestratorPreferences,
} from '../hooks/useNotificationsOrchestratorAnalytics';
import type { NotificationOrchestratorFilters, NotificationDeliveryChannel } from '../types/notifications-orchestrator.types';

const ACCESS_ROLES = ['super_admin', 'hospital_admin', 'tenant_admin', 'security_officer', 'compliance_officer'];

const severityOrder = { critical: 4, warning: 3, success: 2, info: 1 } as const;

const severityOptions = [
  { label: 'All severities', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Success', value: 'success' },
  { label: 'Info', value: 'info' },
];

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Suppressed', value: 'suppressed' },
];

function ChannelCard({ channel }: { channel: NotificationDeliveryChannel }) {
  return (
    <div className={cn('rounded-xl border p-4 bg-black/20', channel.enabled ? 'border-white/[0.08]' : 'border-white/[0.04] opacity-60')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{channel.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{channel.destination}</p>
        </div>
        <span className={cn('text-[10px] font-bold uppercase tracking-widest', channel.enabled ? 'text-success-light' : 'text-gray-500')}>
          {channel.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
          <p className="text-gray-500">Latency</p>
          <p className="text-white font-semibold mt-0.5">{channel.latencyMs}ms</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
          <p className="text-gray-500">Success</p>
          <p className="text-white font-semibold mt-0.5">{channel.successRate}%</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
          <p className="text-gray-500">Last sent</p>
          <p className="text-white font-semibold mt-0.5">{channel.lastDeliveredAt ? new Date(channel.lastDeliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export function NotificationsOrchestratorDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<NotificationOrchestratorFilters>({ search: '', severity: 'all', status: 'all' });

  const { data, isLoading, refetch } = useNotificationsOrchestratorDashboard(filters);
  const retryMessage = useRetryOrchestratorMessage();
  const discardMessage = useDiscardOrchestratorMessage();
  const toggleRoute = useToggleOrchestratorRoute();
  const markRead = useMarkOrchestratorNotificationRead();
  const updatePreferences = useUpdateOrchestratorPreferences();

  useEffect(() => {
    setPageMeta('Notifications Orchestrator', 'Routing engine for service alerts, delivery policies, and notification fan-out');
  }, [setPageMeta]);

  const d = data?.data;

  const inbox = useMemo(() => {
    const items = d?.notifications ?? [];
    const search = filters.search.trim().toLowerCase();
    return items
      .filter((item) => (filters.severity === 'all' ? true : item.severity === filters.severity))
      .filter((item) => (filters.status === 'all' ? true : item.status === filters.status))
      .filter((item) => (search ? [item.title, item.message, item.source, item.category, item.recipient].filter(Boolean).join(' ').toLowerCase().includes(search) : true))
      .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [d?.notifications, filters.search, filters.severity, filters.status]);

  const criticalMessages = useMemo(() => d?.criticalMessages ?? [], [d?.criticalMessages]);
  const activeRoutes = useMemo(() => d?.activeRoutes ?? [], [d?.activeRoutes]);
  const degradedInterfaces = useMemo(() => d?.degradedInterfaces ?? [], [d?.degradedInterfaces]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-[760px] rounded-xl" />
      </div>
    );
  }

  if (!d) {
    return <div className="text-gray-500 py-20 text-center">No orchestrator data available</div>;
  }

  const routedCritical = criticalMessages.length;
  const routeHealth = d.integration.metrics.uptimePercent;
  const notificationsPending = inbox.filter((item) => item.status === 'unread').length;

  return (
    <RoleGuard roles={ACCESS_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Integration' }, { label: 'Notifications Orchestrator' }]} />
          <div className="flex items-center gap-2 text-sm font-bold text-sky-400 bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/25">
            <BellRing className="w-4 h-4" /> Orchestrator Online
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Active routes</p><p className="text-3xl font-black text-white mt-2">{d.activeRoutes.length}</p><p className="text-xs text-gray-500 mt-1">{routeHealth}% platform uptime</p></CardBody></Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Critical messages</p><p className="text-3xl font-black text-emergency-light mt-2">{routedCritical}</p><p className="text-xs text-gray-500 mt-1">Retry/discard queue</p></CardBody></Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Unread notifications</p><p className="text-3xl font-black text-warning-light mt-2">{d.unreadCount ?? notificationsPending}</p><p className="text-xs text-gray-500 mt-1">Needs operator review</p></CardBody></Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Degraded interfaces</p><p className="text-3xl font-black text-amber-400 mt-2">{degradedInterfaces.length}</p><p className="text-xs text-gray-500 mt-1">Requires route attention</p></CardBody></Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 flex flex-col gap-5">
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Delivery Inbox</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Live notification records surfaced from the notification service.</p>
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
                    onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value as NotificationOrchestratorFilters['severity'] }))}
                    options={severityOptions}
                    className="md:w-44"
                  />
                  <Select
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as NotificationOrchestratorFilters['status'] }))}
                    options={statusOptions}
                    className="md:w-44"
                  />
                  <Button variant="outline" onClick={() => void refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="max-h-[620px] overflow-y-auto space-y-3">
                {inbox.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">No notifications match the current filters.</div>
                ) : (
                  inbox.map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border', item.severity === 'critical' ? 'border-emergency/20 bg-emergency/10 text-emergency-light' : item.severity === 'warning' ? 'border-warning/20 bg-warning/10 text-warning-light' : item.severity === 'success' ? 'border-success/20 bg-success/10 text-success-light' : 'border-sky-500/20 bg-sky-500/10 text-sky-400')}>
                              {item.severity}
                            </span>
                            <span className={cn('text-[10px] uppercase tracking-widest font-bold', item.status === 'unread' ? 'text-warning-light' : 'text-gray-500')}>
                              {item.status}
                            </span>
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
                      <div className="flex items-center justify-between gap-3 text-xs text-gray-400 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.channel && <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1"><ServerCog className="w-3 h-3" /> {item.channel}</span>}
                          {item.recipient && <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1"><Inbox className="w-3 h-3" /> {item.recipient}</span>}
                          {item.tags?.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2 py-1">{tag}</span>)}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status !== 'read' && (
                            <Button size="sm" variant="outline" onClick={() => markRead.mutate(item.id)} loading={markRead.isPending}>
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Integration throughput</p><p className="text-3xl font-black text-white mt-2">{d.integration.metrics.messagesPerHour.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">Messages per hour</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Average latency</p><p className="text-3xl font-black text-sky-400 mt-2">{d.integration.metrics.avgLatencyMs}ms</p><p className="text-xs text-gray-500 mt-1">Across active interfaces</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Notification channels</p><p className="text-3xl font-black text-success-light mt-2">{d.channels.filter((channel) => channel.enabled).length}/5</p><p className="text-xs text-gray-500 mt-1">Active delivery paths</p></CardBody></Card>
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col gap-5">
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Routing Engine</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Notification fan-out rules and integration-aware routing controls.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 max-h-[400px] overflow-y-auto">
                {activeRoutes.map((route) => (
                  <div key={route.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{route.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{route.condition}</p>
                      </div>
                      <button onClick={() => toggleRoute.mutate({ id: route.id, active: !route.active })} className="shrink-0">
                        {route.active ? <ToggleRight className="w-7 h-7 text-success-light" /> : <ToggleLeft className="w-7 h-7 text-gray-500" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-[10px] text-gray-400">
                      {route.sourceSystems.map((source) => <span key={source} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">{source}</span>)}
                      <GitMerge className="w-3 h-3 text-gray-500" />
                      {route.destinations.map((destination) => <span key={destination} className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded">{destination}</span>)}
                    </div>
                    <p className="text-xs text-gray-500">Messages routed: <span className="text-white font-semibold">{route.messagesRouted.toLocaleString()}</span></p>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Delivery Channels</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Execution targets for alert fan-out and escalation.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 max-h-[460px] overflow-y-auto">
                {d.channels.map((channel) => <ChannelCard key={channel.id} channel={channel} />)}
              </CardBody>
            </Card>

            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Failure Queue</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Failed integration messages that can be retried or discarded.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 max-h-[360px] overflow-y-auto">
                {criticalMessages.length === 0 ? (
                  <div className="py-10 text-center text-emerald-400 text-sm">No failed messages in queue</div>
                ) : (
                  criticalMessages.map((message) => (
                    <div key={message.id} className="rounded-xl border border-emergency/20 bg-emergency/5 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{message.id}</p>
                          <p className="text-xs text-gray-500 mt-1">{message.type} · {message.standard} · {message.sourceSystem}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emergency-light">{message.status}</span>
                      </div>
                      <p className="text-xs text-emergency-light/90 bg-black/20 border border-emergency/10 rounded-lg p-3 font-mono">{message.errorReason}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => retryMessage.mutate(message.id)} loading={retryMessage.isPending}>
                          Retry
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => discardMessage.mutate(message.id)} loading={discardMessage.isPending} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                          Discard
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>

            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Policy Controls</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Current operator-facing delivery policy for the notification service.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {d.preferences ? (
                  <NotificationSettings
                    preferences={d.preferences}
                    onUpdate={(data) => updatePreferences.mutate(data)}
                    saving={updatePreferences.isPending}
                  />
                ) : (
                  <div className="py-10 text-center text-gray-500">No notification policy available</div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
