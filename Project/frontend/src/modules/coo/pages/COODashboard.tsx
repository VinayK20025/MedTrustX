'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CooKPICard } from '../components/CooKPICard';
import { PatientFlowPanel } from '../components/PatientFlowPanel';
import { BedPanel } from '../components/BedPanel';
import { ICUStatusPanel } from '../components/ICUStatusPanel';
import { AlertsPanel } from '../components/AlertsPanel';
import { TaskPanel } from '../components/TaskPanel';
import { useCooDashboard } from '../hooks/useCooAnalytics';
import type { CooFilters } from '../services/coo.api';

export function COODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CooFilters>({ timeWindow: 'today' });
  const { data, isLoading } = useCooDashboard(filters);

  useEffect(() => {
    setPageMeta('Operations Command', 'Live hospital throughput and execution center');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No operational data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Operations Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-success-light text-sm font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            Live Status
          </div>
          <Select
            options={[
              { label: 'Current Shift', value: 'shift' },
              { label: 'Last 1 Hour', value: '1h' },
              { label: 'Last 4 Hours', value: '4h' },
              { label: 'Today', value: 'today' },
            ]}
            value={filters.timeWindow}
            onChange={(e) => setFilters({ ...filters, timeWindow: e.target.value as any })}
            className="w-full sm:w-40 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {dashboard.kpis.map((kpi) => (
          <CooKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Row 2: Throughput & Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PatientFlowPanel data={dashboard.patientFlow} />
        </div>
        <div>
          <BedPanel data={dashboard.beds} />
        </div>
      </div>

      {/* Row 3: Execution & Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 h-full">
          <ICUStatusPanel data={dashboard.icu} />
        </div>
        <div>
          <AlertsPanel alerts={dashboard.alerts} />
        </div>
        <div>
          <TaskPanel tasks={dashboard.tasks} />
        </div>
      </div>
    </div>
  );
}
