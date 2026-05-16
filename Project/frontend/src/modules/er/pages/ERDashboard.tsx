'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TriageQueue } from '../components/TriageQueue';
import { CriticalPatientPanel } from '../components/CriticalPatientPanel';
import { ResourcePanel } from '../components/ResourcePanel';
import { ERAlertsPanel } from '../components/ERAlertsPanel';
import { useERDashboard } from '../hooks/useERAnalytics';
import type { ERFilters } from '../services/er.api';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-white/[0.04] bg-white/[0.02]', success: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-white', success: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function ERDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<ERFilters>({ view: 'all' });
  const { data, isLoading } = useERDashboard(filters);

  useEffect(() => { setPageMeta('ER Command Center', 'Real-time triage and trauma management'); }, [setPageMeta]);

  if (isLoading) {
    return (<div className="space-y-6 animate-fade-in max-w-[1600px]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>);
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'ER Physician' }, { label: 'Command Center' }]} />
        <Select
          options={[{ label: 'Full ER View', value: 'all' }, { label: 'Triage Only', value: 'triage' }, { label: 'Critical Only', value: 'critical' }]}
          value={filters.view}
          onChange={(e) => setFilters({ ...filters, view: e.target.value as any })}
          className="w-full sm:w-40 bg-surface-dark border-white/[0.08]"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <TriageQueue queue={d.triageQueue} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex-1">
            <CriticalPatientPanel patients={d.criticalPatients} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-[280px]">
            <ResourcePanel resources={d.resources} />
            <ERAlertsPanel alerts={d.alerts} />
          </div>
        </div>
      </div>
    </div>
  );
}
