'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PsychologyPatientPanel } from '../components/PsychologyPatientPanel';
import { PsychologySessionPanel } from '../components/PsychologySessionPanel';
import { PsychologyNotesPanel } from '../components/PsychologyNotesPanel';
import { PsychologyConfidentialPanel } from '../components/PsychologyConfidentialPanel';
import { PsychologyProgressPanel } from '../components/PsychologyProgressPanel';
import { PsychologyAssessmentPanel } from '../components/PsychologyAssessmentPanel';
import { usePsychologyDashboard } from '../hooks/usePsychologyAnalytics';
import type { PsychologyFilters } from '../services/psychology.api';
import type { PsychologyKPI } from '../types/psychology.types';
import { Brain, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function PsychologyKPICard({ kpi }: { kpi: PsychologyKPI }) {
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
        {kpi.trendDirection && (
          <div className={cn('flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded',
            kpi.trendDirection === 'up' ? 'text-success-light bg-success/10' :
            kpi.trendDirection === 'down' ? 'text-emergency-light bg-emergency/10' :
            'text-gray-500 bg-white/5'
          )}>
            {kpi.trendDirection === 'up' && <TrendingUp className="w-2.5 h-2.5" />}
            {kpi.trendDirection === 'down' && <TrendingDown className="w-2.5 h-2.5" />}
            {kpi.trend !== undefined && `${Math.abs(kpi.trend)}`}
          </div>
        )}
      </div>
      <p className={cn('text-2xl font-black mt-2', valueColors[kpi.status])}>{kpi.value}</p>
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function PsychologyDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<PsychologyFilters>({});
  const { data, isLoading } = usePsychologyDashboard(filters);

  useEffect(() => {
    setPageMeta('Clinical Psychologist / Counselor', 'Mental health assessments, psychotherapy sessions, and confidential notes');
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
        <Breadcrumbs items={[{ label: 'Mental Health' }, { label: 'Psychology Workspace' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <Brain className="w-3.5 h-3.5" />
          CLINICAL PSYCHOLOGY
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <PsychologyKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Row 1: Active Patients & Today's Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[500px]">
          <PsychologyPatientPanel patients={d.patients} />
        </div>
        <div className="xl:col-span-5 h-[500px]">
          <PsychologySessionPanel sessions={d.sessionsToday} />
        </div>
      </div>

      {/* Row 2: Standard SOAP Notes & Encrypted Vault */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[400px]">
          <PsychologyNotesPanel notes={d.recentNotes} />
        </div>
        <div className="xl:col-span-4 h-[400px]">
          <PsychologyConfidentialPanel unreadAlerts={d.confidentialAlerts} />
        </div>
      </div>

      {/* Row 3: Progress & Assessments */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[350px]">
          <PsychologyProgressPanel metrics={d.progressMetrics} />
        </div>
        <div className="xl:col-span-5 h-[350px]">
          <PsychologyAssessmentPanel assessments={d.assessments} />
        </div>
      </div>
    </div>
  );
}
