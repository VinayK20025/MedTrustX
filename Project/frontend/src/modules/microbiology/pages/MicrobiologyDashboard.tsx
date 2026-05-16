'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { MicrobiologySamplePanel } from '../components/MicrobiologySamplePanel';
import { MicrobiologyAnalysisPanel } from '../components/MicrobiologyAnalysisPanel';
import { MicrobiologyASTPanel } from '../components/MicrobiologyASTPanel';
import { MicrobiologySurveillancePanel } from '../components/MicrobiologySurveillancePanel';
import { MicrobiologyAlertPanel } from '../components/MicrobiologyAlertPanel';
import { useMicrobiologyDashboard } from '../hooks/useMicrobiologyAnalytics';
import type { MicrobiologyFilters } from '../services/microbiology.api';
import type { MicrobiologyKPI } from '../types/microbiology.types';
import { Bug, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function MicrobiologyKPICard({ kpi }: { kpi: MicrobiologyKPI }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover',
      statusColors[kpi.status]
    )} onClick={() => kpi.actionUrl && router.push(kpi.actionUrl)}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      </div>
      <p className={cn('text-2xl font-black mt-2', valueColors[kpi.status])}>{kpi.value}</p>
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function MicrobiologyDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<MicrobiologyFilters>({});
  const { data, isLoading } = useMicrobiologyDashboard(filters);

  useEffect(() => {
    setPageMeta('Microbiologist', 'Pathogen intelligence, AST resistance tracking, and outbreak surveillance');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Microbiology' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-teal-300 bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/25">
          <Bug className="w-3.5 h-3.5" />
          PATHOGEN INTELLIGENCE
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <MicrobiologyKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Row 1: Samples & Identification */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[350px]">
          <MicrobiologySamplePanel samples={d.samples} />
        </div>
        <div className="xl:col-span-7 h-[350px]">
          <MicrobiologyAnalysisPanel activeSample={d.activeSample} identifications={d.identifications} />
        </div>
      </div>

      {/* Row 2: AST & Surveillance */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[400px]">
          <MicrobiologyASTPanel activeSample={d.activeSample} astResults={d.astResults} />
        </div>
        <div className="xl:col-span-4 h-[400px]">
          <div className="flex flex-col gap-5 h-full">
            <div className="flex-1"><MicrobiologySurveillancePanel surveillance={d.surveillance} /></div>
            <div className="flex-1"><MicrobiologyAlertPanel alerts={d.alerts} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
