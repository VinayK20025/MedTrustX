'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CnoKPICard } from '../components/CnoKPICard';
import { TaskBoard } from '../components/TaskBoard';
import { StaffingPanel } from '../components/StaffingPanel';
import { CarePanel } from '../components/CarePanel';
import { ShiftPanel } from '../components/ShiftPanel';
import { CnoAlertsPanel } from '../components/CnoAlertsPanel';
import { useCnoDashboard } from '../hooks/useCnoAnalytics';
import type { CnoFilters } from '../services/cno.api';

export function CNODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CnoFilters>({ shiftId: 'current' });
  const { data, isLoading } = useCnoDashboard(filters);

  useEffect(() => {
    setPageMeta('Nursing Command', 'Shift orchestration and bedside care tracking');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Skeleton className="h-[480px] w-full rounded-xl lg:col-span-3" />
          <Skeleton className="h-[480px] w-full rounded-xl" />
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
        <Breadcrumbs items={[{ label: 'CNO Command' }, { label: 'Nursing Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-success-light text-sm font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            Shift Active
          </div>
          <Select
            options={[
              { label: 'Current Shift', value: 'current' },
              { label: 'Next Shift', value: 'next' },
              { label: 'Previous Shift', value: 'previous' },
            ]}
            value={filters.shiftId}
            onChange={(e) => setFilters({ ...filters, shiftId: e.target.value as any })}
            className="w-full sm:w-48 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi) => (
          <CnoKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Main Task Orchestration */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <TaskBoard tasks={dashboard.tasks} />
        </div>
        <div>
          <StaffingPanel data={dashboard.staffing} />
        </div>
      </div>

      {/* Operational Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <CarePanel data={dashboard.careStatus} />
        </div>
        <div>
          <ShiftPanel data={dashboard.shift} />
        </div>
        <div>
          <CnoAlertsPanel alerts={dashboard.alerts} />
        </div>
      </div>
    </div>
  );
}
