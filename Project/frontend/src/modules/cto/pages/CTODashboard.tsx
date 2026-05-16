'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CtoKPICard } from '../components/CtoKPICard';
import { ServiceMapPanel } from '../components/ServiceMapPanel';
import { PipelinePanel } from '../components/PipelinePanel';
import { PerformancePanel } from '../components/PerformancePanel';
import { TechDebtPanel } from '../components/TechDebtPanel';
import { useCtoDashboard } from '../hooks/useCtoAnalytics';
import type { CtoFilters } from '../services/cto.api';

export function CTODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CtoFilters>({ environment: 'production', timeRange: '1h' });
  const { data, isLoading } = useCtoDashboard(filters);

  useEffect(() => {
    setPageMeta('Engineering Platform', 'Service architecture, CI/CD pipelines & performance engineering');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[450px] w-full rounded-xl" />
          <Skeleton className="h-[450px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No engineering telemetry available</div>;

  // Derive platform health from service statuses
  const degradedCount = dashboard.services.filter(s => s.status !== 'healthy').length;
  const platformHealth = degradedCount === 0 ? 'ALL SYSTEMS GO' : degradedCount >= 2 ? 'DEGRADED' : 'PARTIAL';
  const healthColor = platformHealth === 'ALL SYSTEMS GO' ? 'bg-success/10 border-success/20 text-success-light' : platformHealth === 'DEGRADED' ? 'bg-emergency/10 border-emergency/20 text-emergency-light' : 'bg-warning/10 border-warning/20 text-warning-light';

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'CTO Command' }, { label: 'Engineering Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Platform Health Indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold font-mono ${healthColor}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${platformHealth === 'ALL SYSTEMS GO' ? 'bg-success' : platformHealth === 'DEGRADED' ? 'bg-emergency' : 'bg-warning'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${platformHealth === 'ALL SYSTEMS GO' ? 'bg-success' : platformHealth === 'DEGRADED' ? 'bg-emergency' : 'bg-warning'}`}></span>
            </span>
            {platformHealth}
          </div>
          <Select
            options={[
              { label: 'Production', value: 'production' },
              { label: 'Staging', value: 'staging' },
              { label: 'Development', value: 'development' },
            ]}
            value={filters.environment}
            onChange={(e) => setFilters({ ...filters, environment: e.target.value as any })}
            className="w-full sm:w-36 bg-surface-dark border-white/[0.08]"
          />
          <Select
            options={[
              { label: 'Last 1 Hour', value: '1h' },
              { label: 'Last 6 Hours', value: '6h' },
              { label: 'Last 24 Hours', value: '24h' },
              { label: 'Last 7 Days', value: '7d' },
            ]}
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
            className="w-full sm:w-36 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {dashboard.kpis.map((kpi) => (
          <CtoKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Service Map + Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ServiceMapPanel services={dashboard.services} />
        <PipelinePanel pipelines={dashboard.pipelines} />
      </div>

      {/* Performance + Tech Debt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformancePanel metrics={dashboard.performance} />
        <TechDebtPanel items={dashboard.techDebt} />
      </div>
    </div>
  );
}
