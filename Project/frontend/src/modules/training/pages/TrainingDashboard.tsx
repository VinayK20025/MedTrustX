'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TrainingStaffMatrix } from '../components/TrainingStaffMatrix';
import { TrainingSchedulePanel } from '../components/TrainingSchedulePanel';
import { TrainingCertAlertPanel } from '../components/TrainingCertAlertPanel';
import { useTrainingDashboard } from '../hooks/useTrainingAnalytics';
import type { TrainingFilters } from '../services/training.api';
import type { TrainingKPI } from '../types/training.types';
import { GraduationCap, AlertTriangle } from 'lucide-react';

function TrainKPICard({ kpi }: { kpi: TrainingKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function TrainingDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<TrainingFilters>({});
  const { data, isLoading } = useTrainingDashboard(filters);

  useEffect(() => { setPageMeta('Training Coordinator', 'Compliance-driven workforce training, scheduling, and certification tracking'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'HR & Development' }, { label: 'Training Command' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <GraduationCap className="w-3.5 h-3.5" /> TRAINING TERMINAL
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <TrainKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[650px]">
          <TrainingStaffMatrix records={d.staffRecords} />
        </div>
        <div className="xl:col-span-4 h-[650px]">
          <TrainingSchedulePanel sessions={d.upcomingSessions} programs={d.programs} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          <TrainingCertAlertPanel alerts={d.certAlerts} />
        </div>
      </div>
    </div>
  );
}
