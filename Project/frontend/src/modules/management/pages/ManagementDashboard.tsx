'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { cn } from '@/utils/cn';
import { ArrowRight, CheckCircle2, ClipboardList, ExternalLink, GitMerge, Layers3, RefreshCw, Search, ShieldAlert, ShieldCheck, UserCog } from 'lucide-react';
import { useDeleteManagementTask, useManagementDashboard, useUpdateManagementTask } from '../hooks/useManagementAnalytics';
import type { ManagementTask } from '../types/management.types';

const ACCESS_ROLES = ['super_admin', 'hospital_admin', 'tenant_admin', 'chief_medical_officer', 'department_head'];

const priorityOptions = [
  { label: 'All priorities', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Monitoring', value: 'monitoring' },
];

const categoryOptions = [
  { label: 'All categories', value: 'all' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Security', value: 'Security' },
  { label: 'Infrastructure', value: 'Infrastructure' },
  { label: 'Clinical Governance', value: 'Clinical Governance' },
];

function KPI({ title, value, delta, icon, tone }: { title: string; value: string | number; delta?: string; icon: React.ReactNode; tone: 'normal' | 'success' | 'warning' | 'critical' }) {
  const toneStyles: Record<typeof tone, string> = {
    normal: 'border-white/[0.06] bg-surface-light',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    critical: 'border-emergency/20 bg-emergency/5',
  };

  return (
    <Card className={cn('shadow-glass', toneStyles[tone])}>
      <CardBody className="p-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">{title}</p>
          <p className="text-3xl font-black text-white mt-2">{value}</p>
          {delta && <p className="text-xs text-gray-500 mt-1">{delta}</p>}
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-current">{icon}</div>
      </CardBody>
    </Card>
  );
}

function TaskCard({ task, onComplete, onEscalate, onDelete }: { task: ManagementTask; onComplete: (id: string) => void; onEscalate: (id: string) => void; onDelete: (id: string) => void; }) {
  const priorityStyles: Record<ManagementTask['priority'], string> = {
    low: 'text-gray-400 border-white/10 bg-white/5',
    medium: 'text-sky-400 border-sky-500/20 bg-sky-500/10',
    high: 'text-warning-light border-warning/20 bg-warning/10',
    critical: 'text-emergency-light border-emergency/20 bg-emergency/10',
  };

  const statusStyles: Record<ManagementTask['status'], string> = {
    open: 'text-warning-light',
    in_progress: 'text-sky-400',
    blocked: 'text-emergency-light',
    resolved: 'text-success-light',
    monitoring: 'text-gray-400',
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{task.title}</p>
          <p className="text-xs text-gray-500 mt-1">{task.category} · {task.owner}</p>
        </div>
        <span className={cn('text-[10px] font-bold uppercase tracking-widest rounded-full border px-2 py-1', priorityStyles[task.priority])}>
          {task.priority}
        </span>
      </div>
      {task.description && <p className="text-sm text-gray-400">{task.description}</p>}
      <div className="flex items-center justify-between gap-3 text-xs text-gray-400 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('font-bold uppercase tracking-widest', statusStyles[task.status])}>{task.status}</span>
          <span className="text-gray-500">Updated {new Date(task.updatedAt).toLocaleString()}</span>
          {task.tags?.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2 py-1">{tag}</span>)}
        </div>
        {task.route && (
          <Link href={task.route} className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300">
            Open <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="flex gap-2 pt-1 flex-wrap">
        {task.status !== 'resolved' && <Button size="sm" variant="outline" onClick={() => onComplete(task.id)}><CheckCircle2 className="w-3.5 h-3.5" />Resolve</Button>}
        {task.status !== 'blocked' && <Button size="sm" variant="secondary" onClick={() => onEscalate(task.id)}><ShieldAlert className="w-3.5 h-3.5" />Escalate</Button>}
        <Button size="sm" variant="ghost" onClick={() => onDelete(task.id)}><ClipboardList className="w-3.5 h-3.5" />Archive</Button>
      </div>
    </div>
  );
}

export function ManagementDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState({ search: '', priority: 'all', status: 'all', category: 'all' });
  const { data, isLoading, refetch } = useManagementDashboard({
    search: filters.search,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    status: filters.status === 'all' ? undefined : filters.status,
    category: filters.category === 'all' ? undefined : filters.category,
  });
  const updateTask = useUpdateManagementTask();
  const deleteTask = useDeleteManagementTask();

  useEffect(() => {
    setPageMeta('Management Command Center', 'Cross-functional operations, routing, and governance orchestration');
  }, [setPageMeta]);

  const d = data?.data;
  const filteredWork = useMemo(() => d?.workItems ?? [], [d?.workItems]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1800px] mx-auto">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-[820px] rounded-xl" />
      </div>
    );
  }

  if (!d) return <div className="text-gray-500 py-20 text-center">No management data available</div>;

  const openCount = d.workItems.filter((task) => task.status === 'open').length;
  const blockedCount = d.workItems.filter((task) => task.status === 'blocked').length;
  const resolvedCount = d.workItems.filter((task) => task.status === 'resolved').length;

  return (
    <RoleGuard roles={ACCESS_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1800px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Management Command Center' }]} />
          <div className="flex items-center gap-2 text-[11px] font-bold text-sky-300 bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/25 whitespace-nowrap">
            <UserCog className="w-3.5 h-3.5" /> MANAGEMENT SERVICE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPI title="Open Work Items" value={openCount} delta={`${resolvedCount} resolved today`} icon={<ClipboardList className="w-4 h-4" />} tone="warning" />
          <KPI title="Blocked Tasks" value={blockedCount} delta="Requires escalation" icon={<ShieldAlert className="w-4 h-4" />} tone="critical" />
          <KPI title="Active Routes" value={d.routes.filter((route) => route.active).length} delta="Cross-service orchestration" icon={<GitMerge className="w-4 h-4" />} tone="success" />
          <KPI title="Modules Linked" value={d.operationalPanels.length + d.externalModules.length} delta="Core + external surfaces" icon={<Layers3 className="w-4 h-4" />} tone="normal" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 flex flex-col gap-5">
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Management Work Queue</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Operational tasks captured from the generic management service and normalized into cross-functional actions.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input value={filters.search} onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))} placeholder="Search tasks" className="pl-10" />
                  </div>
                  <Select value={filters.priority} onChange={(e) => setFilters((current) => ({ ...current, priority: e.target.value }))} options={priorityOptions} className="md:w-40" />
                  <Select value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))} options={statusOptions} className="md:w-40" />
                  <Select value={filters.category} onChange={(e) => setFilters((current) => ({ ...current, category: e.target.value }))} options={categoryOptions} className="md:w-48" />
                  <Button variant="outline" onClick={() => void refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
                </div>
              </CardHeader>
              <CardBody className="max-h-[640px] overflow-y-auto space-y-3">
                {filteredWork.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">No tasks match the current filters.</div>
                ) : (
                  filteredWork.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={(id) => updateTask.mutate({ id, payload: { status: 'resolved' } })}
                      onEscalate={(id) => updateTask.mutate({ id, payload: { status: 'blocked' } })}
                      onDelete={(id) => deleteTask.mutate(id)}
                    />
                  ))
                )}
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI title="Cross-functional routes" value={d.routes.length} delta="Policy, evidence, visitor, network" icon={<GitMerge className="w-4 h-4" />} tone="normal" />
              <KPI title="External modules" value={d.externalModules.length} delta="Executive and operational surfaces" icon={<ExternalLink className="w-4 h-4" />} tone="success" />
              <KPI title="Service health" value="Nominal" delta="Management service polling active" icon={<ShieldCheck className="w-4 h-4" />} tone="success" />
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col gap-5">
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Routing Overview</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Management rules that fan out into existing control surfaces.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 max-h-[420px] overflow-y-auto">
                {d.routes.map((route) => (
                  <div key={route.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{route.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{route.condition}</p>
                      </div>
                      <span className={cn('text-[10px] font-bold uppercase tracking-widest', route.active ? 'text-success-light' : 'text-gray-500')}>
                        {route.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded">{route.source}</span>
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-1 rounded">{route.destination}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
                        <p className="text-gray-500">Throughput</p>
                        <p className="text-white font-semibold mt-0.5">{route.throughputPerHour}/h</p>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
                        <p className="text-gray-500">Latency</p>
                        <p className="text-white font-semibold mt-0.5">{route.latencyMs}ms</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Operational Surfaces</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Direct links into live management modules already present in the platform.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {d.operationalPanels.map((panel) => (
                  <Link key={panel.id} href={panel.href} className="block rounded-xl border border-white/[0.06] bg-black/20 p-4 hover:border-white/[0.14] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{panel.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{panel.description}</p>
                      </div>
                      <span className={cn('text-[10px] font-bold uppercase tracking-widest', panel.status === 'alert' ? 'text-emergency-light' : panel.status === 'watch' ? 'text-warning-light' : 'text-success-light')}>
                        {panel.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </CardBody>
            </Card>

            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">External Modules</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Higher-level governance and adjacent command surfaces.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {d.externalModules.map((module) => (
                  <Link key={module.label} href={module.href} className="block rounded-xl border border-white/[0.06] bg-black/20 p-4 hover:border-white/[0.14] hover:bg-white/[0.04] transition-colors">
                    <p className="font-semibold text-white">{module.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                  </Link>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
