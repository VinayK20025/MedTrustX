'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CmoKPICard } from '../components/CmoKPICard';
import { OutcomesPanel } from '../components/OutcomesPanel';
import { InfectionPanel } from '../components/InfectionPanel';
import { IcuOversightPanel } from '../components/IcuOversightPanel';
import { ClinicalAlertsPanel } from '../components/ClinicalAlertsPanel';
import { AuditPanel } from '../components/AuditPanel';
import { useCmoDashboard } from '../hooks/useCmoAnalytics';
import type { CmoFilters } from '../services/cmo.api';

export function CMODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CmoFilters>({ timeWindow: '30d' });
  const { data, isLoading } = useCmoDashboard(filters);

  useEffect(() => {
    setPageMeta('Clinical Governance', 'Oversight of clinical outcomes, safety, and compliance');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No clinical data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'CMO Governance' }, { label: 'Clinical Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            options={[
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 90 Days', value: '90d' },
              { label: 'Year to Date', value: 'ytd' },
            ]}
            value={filters.timeWindow}
            onChange={(e) => setFilters({ ...filters, timeWindow: e.target.value as any })}
            className="w-full sm:w-48 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi) => (
          <CmoKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Row 2: Clinical Outcomes & Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OutcomesPanel data={dashboard.outcomes} />
        <InfectionPanel data={dashboard.infection} />
      </div>

      {/* Row 3: Audit, Alerts & Critical Care */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <IcuOversightPanel data={dashboard.icuOversight} />
          <AuditPanel data={dashboard.audit} />
        </div>
        <div className="lg:col-span-2">
          <ClinicalAlertsPanel alerts={dashboard.alerts} />
        </div>
      </div>
    </div>
  );
}
