'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { SuperKPICard } from '@/modules/superintendent/components/SuperKPICard';
import { PatientPanel } from '../components/PatientPanel';
import { StaffPanel } from '../components/StaffPanel';
import { OutcomesPanel } from '../components/OutcomesPanel';
import { AlertsPanel } from '../components/AlertsPanel';
import { useHODDashboard } from '../hooks/useHODAnalytics';
import type { HODFilters } from '../services/hod.api';

export function HODDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<HODFilters>({ period: '7d' });
  const { data, isLoading } = useHODDashboard(filters);

  useEffect(() => {
    setPageMeta('Department Command', 'Clinical, staff & performance monitoring');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No department data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'HOD' }, { label: `${d.department} Dashboard` }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-xs font-bold text-indigo-300">
            {d.department}
          </div>
          <Select
            options={[
              { label: 'Today', value: 'today' },
              { label: 'Last 7 Days', value: '7d' },
              { label: 'Last 30 Days', value: '30d' },
            ]}
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
            className="w-full sm:w-36 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {d.kpis.map(kpi => <SuperKPICard key={kpi.id} kpi={kpi as any} />)}
      </div>

      <PatientPanel patients={d.patients} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StaffPanel staff={d.staff} />
        <OutcomesPanel outcomes={d.outcomes} />
      </div>

      <AlertsPanel alerts={d.alerts} />
    </div>
  );
}
