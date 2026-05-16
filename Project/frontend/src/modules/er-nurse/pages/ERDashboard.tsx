'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ERTriageQueue } from '../components/ERTriageQueue';
import { ERActivePatients } from '../components/ERActivePatients';
import { EREmergencyCare } from '../components/EREmergencyCare';
import { ERAlertsPanel } from '../components/ERAlertsPanel';
import { useERDashboard } from '../hooks/useERAnalytics';
import { Siren } from 'lucide-react';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-white/[0.04] bg-white/[0.02]', success: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-white', success: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-3 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function ERDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useERDashboard({});

  useEffect(() => { setPageMeta('ER Triage', 'Rapid emergency response and queue management'); }, [setPageMeta]);

  if (isLoading) {
    return (<div className="space-y-6 animate-fade-in max-w-[1600px]">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
    </div>);
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'ER Nurse' }, { label: 'ER Control' }]} />
        <div className="flex items-center gap-2 text-sm font-bold text-emergency-light bg-emergency/10 px-4 py-2 rounded-lg border border-emergency/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Siren className="w-4 h-4 animate-pulse" /> CODE RED: STANDBY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-auto xl:h-[700px]">
        {/* Left: Triage Queue (CORE) */}
        <div className="xl:col-span-5 h-[500px] xl:h-full flex flex-col gap-4">
           <div className="flex-1">
             <ERTriageQueue queue={d.triageQueue} />
           </div>
        </div>
        
        {/* Right: Active Cases, Care, Alerts */}
        <div className="xl:col-span-7 h-auto xl:h-full flex flex-col gap-4">
           {/* Top Half: Alerts & Active Patients */}
           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
             <ERAlertsPanel alerts={d.alerts} />
             <ERActivePatients patients={d.activePatients} />
           </div>
           
           {/* Bottom Half: Quick Interventions */}
           <div className="flex-1">
             <EREmergencyCare actions={d.careActions} />
           </div>
        </div>
      </div>
    </div>
  );
}
