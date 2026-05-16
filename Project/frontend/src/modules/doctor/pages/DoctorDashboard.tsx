'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PatientListPanel } from '../components/PatientListPanel';
import { SchedulePanel } from '../components/SchedulePanel';
import { TimelinePanel } from '../components/TimelinePanel';
import { DoctorAlertsPanel } from '../components/DoctorAlertsPanel';
import { useDoctorDashboard } from '../hooks/useDoctorAnalytics';
import type { DoctorFilters } from '../services/doctor.api';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function DoctorDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<DoctorFilters>({ view: 'all' });
  const { data, isLoading } = useDoctorDashboard(filters);

  useEffect(() => { setPageMeta('Clinical Workspace', 'Patients, schedule & clinical activity'); }, [setPageMeta]);

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
        <Breadcrumbs items={[{ label: 'Doctor' }, { label: 'Dashboard' }]} />
        <Select
          options={[{ label: 'All Patients', value: 'all' }, { label: 'OPD Only', value: 'opd' }, { label: 'IPD Only', value: 'ipd' }]}
          value={filters.view}
          onChange={(e) => setFilters({ ...filters, view: e.target.value as any })}
          className="w-full sm:w-36 bg-surface-dark border-white/[0.08]"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <PatientListPanel patients={d.patients} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SchedulePanel appointments={d.appointments} />
        <DoctorAlertsPanel alerts={d.alerts} />
      </div>

      <TimelinePanel entries={d.recentTimeline} />
    </div>
  );
}
