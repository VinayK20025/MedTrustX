'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { ActionableKPICard } from '../components/ActionableKPICard';
import { OperationsCommandGrid } from '../components/OperationsCommandGrid';
import { FinancialOverviewPanel } from '../components/FinancialOverviewPanel';
import { AlertsPanel } from '../components/AlertsPanel';
import { TaskPanel } from '../components/TaskPanel';
import { useCeoDashboard } from '../hooks/useCeoAnalytics';
import type { CeoFilters } from '../services/ceo.api';

export function CEODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CeoFilters>({ timeRange: 'today' });
  const { data, isLoading } = useCeoDashboard(filters);

  useEffect(() => {
    setPageMeta('Command Center', 'Real-time operational execution and performance metrics');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No operational data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Global Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'CEO View' }, { label: 'Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            options={[
              { label: 'Today (Live)', value: 'today' },
              { label: 'Trailing 7 Days', value: '7d' },
              { label: 'Trailing 30 Days', value: '30d' },
            ]}
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
            className="w-full sm:w-48 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row (Actionable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(dashboard.kpis || []).map((kpi) => (
          <ActionableKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Row 2: Operations & Financial Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OperationsCommandGrid data={dashboard.operations} />
        <FinancialOverviewPanel data={dashboard.financial} />
      </div>

      {/* Row 3: Alerts & Tasks (Execution Focus) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertsPanel alerts={dashboard.alerts || []} />
        <TaskPanel tasks={dashboard.tasks || []} />
      </div>
    </div>
  );
}
