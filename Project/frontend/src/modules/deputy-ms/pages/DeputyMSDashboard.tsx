'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { SuperKPICard } from '@/modules/superintendent/components/SuperKPICard';
import { FlowPanel } from '../components/FlowPanel';
import { WardMiniPanel } from '../components/WardMiniPanel';
import { IssuesPanel } from '../components/IssuesPanel';
import { TaskBoard } from '../components/TaskBoard';
import { useDeputyMSDashboard } from '../hooks/useDeputyMSAnalytics';
import type { DeputyFilters } from '../services/deputy-ms.api';

export function DeputyMSDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<DeputyFilters>({ shift: 'all' });
  const { data, isLoading } = useDeputyMSDashboard(filters);

  useEffect(() => {
    setPageMeta('Execution Console', 'Real-time patient flow, issue resolution & task execution');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No execution data available</div>;

  const criticalIssues = d.issues.filter(i => i.severity === 'critical' && i.status === 'open').length;
  const liveStatus = criticalIssues >= 2 ? 'FIRES ACTIVE' : criticalIssues === 1 ? 'ATTENTION' : 'CLEAR';
  const liveColor = liveStatus === 'CLEAR' ? 'bg-success/10 border-success/20 text-success-light' : liveStatus === 'FIRES ACTIVE' ? 'bg-emergency/10 border-emergency/20 text-emergency-light' : 'bg-warning/10 border-warning/20 text-warning-light';
  const liveDot = liveStatus === 'CLEAR' ? 'bg-success' : liveStatus === 'FIRES ACTIVE' ? 'bg-emergency' : 'bg-warning';

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Execution Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${liveColor}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveDot}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveDot}`}></span>
            </span>
            {liveStatus}
          </div>
          <Select
            options={[
              { label: 'All Shifts', value: 'all' },
              { label: 'Morning', value: 'morning' },
              { label: 'Afternoon', value: 'afternoon' },
              { label: 'Night', value: 'night' },
            ]}
            value={filters.shift}
            onChange={(e) => setFilters({ ...filters, shift: e.target.value as any })}
            className="w-full sm:w-36 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {d.kpis.map(kpi => <SuperKPICard key={kpi.id} kpi={kpi as any} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><FlowPanel entries={d.flowQueue} /></div>
        <WardMiniPanel wards={d.wards} />
      </div>

      <IssuesPanel issues={d.issues} />
      <TaskBoard tasks={d.tasks} />
    </div>
  );
}
