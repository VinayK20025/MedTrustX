'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CioKPICard } from '../components/CioKPICard';
import { ServicesPanel } from '../components/ServicesPanel';
import { InfraPanel } from '../components/InfraPanel';
import { DataPanel } from '../components/DataPanel';
import { CioAlertsPanel } from '../components/CioAlertsPanel';
import { IncidentPanel } from '../components/IncidentPanel';
import { useCioDashboard } from '../hooks/useCioAnalytics';
import type { CioFilters } from '../services/cio.api';

export function CIODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CioFilters>({ environment: 'prod', timeWindow: '1h' });
  const { data, isLoading } = useCioDashboard(filters);

  useEffect(() => {
    setPageMeta('IT Operations Command', 'Hospital-wide observability and digital infrastructure control');
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No telemetry data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'CIO Command' }, { label: 'System Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            options={[
              { label: 'Production', value: 'prod' },
              { label: 'Staging', value: 'staging' },
            ]}
            value={filters.environment}
            onChange={(e) => setFilters({ ...filters, environment: e.target.value as any })}
            className="w-full sm:w-40 bg-surface-dark border-white/[0.08]"
          />
          <Select
            options={[
              { label: 'Last 1 Hour', value: '1h' },
              { label: 'Last 24 Hours', value: '24h' },
              { label: 'Last 7 Days', value: '7d' },
            ]}
            value={filters.timeWindow}
            onChange={(e) => setFilters({ ...filters, timeWindow: e.target.value as any })}
            className="w-full sm:w-40 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi) => (
          <CioKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Observability: Services & Infra */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ServicesPanel services={dashboard.services} />
        </div>
        <div>
          <InfraPanel nodes={dashboard.infrastructure} />
        </div>
      </div>

      {/* Data & Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <DataPanel pipelines={dashboard.pipelines} />
        </div>
        <div>
          <CioAlertsPanel alerts={dashboard.alerts} />
        </div>
        <div>
          <IncidentPanel incidents={dashboard.incidents} />
        </div>
      </div>
    </div>
  );
}
