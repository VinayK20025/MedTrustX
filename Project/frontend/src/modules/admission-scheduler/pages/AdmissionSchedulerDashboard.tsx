'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { SchedulerCalendarView } from '../components/SchedulerCalendarView';
import { AdmissionWizardPanel } from '../components/AdmissionWizardPanel';
import { AdmissionSidePanel } from '../components/AdmissionSidePanel';
import { useAdmissionSchedulerDashboard } from '../hooks/useAdmissionSchedulerAnalytics';
import type { AdmSchedulerFilters } from '../services/admissionScheduler.api';
import type { AdmissionSchedulerKPI } from '../types/admissionScheduler.types';
import { CalendarClock, ClipboardPlus, AlertTriangle } from 'lucide-react';

function ASKPICard({ kpi }: { kpi: AdmissionSchedulerKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'warning' && <AlertTriangle className="w-3 h-3 text-warning-light" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function AdmissionSchedulerDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [mode, setMode] = useState<'scheduling' | 'admission'>('scheduling');
  const [filters] = useState<AdmSchedulerFilters>({});
  const { data, isLoading } = useAdmissionSchedulerDashboard(filters);

  useEffect(() => { setPageMeta('Admission Officer & Scheduler', 'Dual-mode scheduling and admission workflow'); }, [setPageMeta]);

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
        <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Admission & Scheduling' }]} />
        {/* Dual-Mode Toggle */}
        <div className="flex items-center bg-surface-light border border-white/10 rounded-xl p-1 shadow-glass-sm">
          <button onClick={() => setMode('scheduling')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all', mode === 'scheduling' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white')}>
            <CalendarClock className="w-4 h-4" /> Appointments
          </button>
          <button onClick={() => setMode('admission')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all', mode === 'admission' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white')}>
            <ClipboardPlus className="w-4 h-4" /> Admissions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <ASKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[650px]">
          {mode === 'scheduling' ? <SchedulerCalendarView schedules={d.doctorSchedules} /> : <AdmissionWizardPanel beds={d.beds} />}
        </div>
        <div className="xl:col-span-4 h-[650px]">
          <AdmissionSidePanel waitlist={d.waitlist} admissions={d.activeAdmissions} />
        </div>
      </div>
    </div>
  );
}
