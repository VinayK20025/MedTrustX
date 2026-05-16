'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { SuperKPICard } from '../components/SuperKPICard';
import { PatientFlowPanel } from '../components/PatientFlowPanel';
import { WardPanel } from '../components/WardPanel';
import { ICUOTPanel } from '../components/ICUOTPanel';
import { TaskPanel } from '../components/TaskPanel';
import { useSuperintendentDashboard } from '../hooks/useSuperintendentAnalytics';
import type { SuperFilters } from '../services/superintendent.api';

export function SuperintendentDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<SuperFilters>({ shift: 'all' });
  const { data, isLoading } = useSuperintendentDashboard(filters);

  useEffect(() => {
    setPageMeta('Clinical Operations', 'Patient flow, ward status & floor coordination');
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
  if (!d) return <div className="text-gray-500 py-20 text-center">No operational data available</div>;

  // Live status indicator
  const criticalAlerts = d.alerts.filter(a => a.type === 'critical').length;
  const liveStatus = criticalAlerts >= 2 ? 'CRITICAL' : criticalAlerts === 1 ? 'ATTENTION' : 'OPERATIONAL';
  const liveColor = liveStatus === 'OPERATIONAL' ? 'bg-success/10 border-success/20 text-success-light' : liveStatus === 'CRITICAL' ? 'bg-emergency/10 border-emergency/20 text-emergency-light' : 'bg-warning/10 border-warning/20 text-warning-light';
  const liveDot = liveStatus === 'OPERATIONAL' ? 'bg-success' : liveStatus === 'CRITICAL' ? 'bg-emergency' : 'bg-warning';

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Operations Dashboard' }]} />
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
        {d.kpis.map(kpi => <SuperKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatientFlowPanel entries={d.patientFlow} />
        <WardPanel wards={d.wards} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ICUOTPanel units={d.icuOt} />
        <TaskPanel tasks={d.tasks} />
      </div>
    </div>
  );
}
