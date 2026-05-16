'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { ClinicalKPICard } from '../components/ClinicalKPICard';
import { DepartmentPanel } from '../components/DepartmentPanel';
import { QualityPanel } from '../components/QualityPanel';
import { SafetyPanel } from '../components/SafetyPanel';
import { ProtocolPanel } from '../components/ProtocolPanel';
import { useMedDirectorDashboard } from '../hooks/useMedDirectorAnalytics';
import type { MedDirectorFilters } from '../services/med-director.api';

export function MedDirectorDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<MedDirectorFilters>({ period: '30d' });
  const { data, isLoading } = useMedDirectorDashboard(filters);

  useEffect(() => {
    setPageMeta('Clinical Governance', 'Quality outcomes, patient safety & protocol enforcement');
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
  if (!d) return <div className="text-gray-500 py-20 text-center">No clinical governance data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Medical Director' }, { label: 'Clinical Dashboard' }]} />
        <Select
          options={[
            { label: 'Today', value: 'today' },
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' },
          ]}
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
          className="w-full sm:w-44 bg-surface-dark border-white/[0.08]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {d.kpis.map(kpi => <ClinicalKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <DepartmentPanel departments={d.departments} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QualityPanel outcomes={d.outcomes} />
        <SafetyPanel incidents={d.incidents} />
      </div>

      <ProtocolPanel protocols={d.protocols} />
    </div>
  );
}
