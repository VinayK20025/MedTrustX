'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { CriticalCasesList } from '../components/CriticalCasesList';
import { PatientSummaryPanel } from '../components/PatientSummaryPanel';
import { VitalsTrendsPanel } from '../components/VitalsTrendsPanel';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import { useIntensivistDashboard } from '../hooks/useIntensivistAnalytics';
import type { IntensivistFilters } from '../services/intensivist.api';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-white/[0.04] bg-white/[0.02]', success: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-white', success: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function IntensivistDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<IntensivistFilters>({ unit: 'all', status: 'pending' });
  const { data, isLoading } = useIntensivistDashboard(filters);

  useEffect(() => { setPageMeta('External Consults', 'High-signal critical case review'); }, [setPageMeta]);

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
        <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Case Review' }]} />
        <div className="flex gap-3">
          <Select
            options={[{ label: 'All Units', value: 'all' }, { label: 'Medical ICU', value: 'medical_icu' }, { label: 'Neuro ICU', value: 'neuro_icu' }]}
            value={filters.unit}
            onChange={(e) => setFilters({ ...filters, unit: e.target.value as any })}
            className="w-36 bg-surface-dark border-white/[0.08]"
          />
          <Select
            options={[{ label: 'Pending Only', value: 'pending' }, { label: 'All Cases', value: 'all' }]}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="w-36 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Case List */}
        <div className="lg:col-span-3 h-[800px]">
          <CriticalCasesList cases={d.cases} />
        </div>
        
        {/* Middle Col: Deep Clinical Summary & Vitals */}
        <div className="lg:col-span-6 flex flex-col gap-5 h-[800px]">
          <div className="flex-1">
            <PatientSummaryPanel details={d.activeReview} />
          </div>
          <div className="h-[350px]">
            <VitalsTrendsPanel details={d.activeReview} />
          </div>
        </div>

        {/* Right Col: Recommendation & Directives */}
        <div className="lg:col-span-3 h-[800px]">
          <RecommendationsPanel caseId={d.activeReview?.caseInfo.id || ''} />
        </div>
      </div>
    </div>
  );
}
