'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ANMPatientCards } from '../components/ANMPatientCards';
import { ANMVisitRecording } from '../components/ANMVisitRecording';
import { ANMAlertsPanel } from '../components/ANMAlertsPanel';
import { useANMDashboard } from '../hooks/useANMAnalytics';
import { CloudOff } from 'lucide-react';

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

export function ANMDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useANMDashboard({});

  useEffect(() => { setPageMeta('ANM', 'Community maternal and child healthcare'); }, [setPageMeta]);

  if (isLoading) {
    return (<div className="space-y-6 animate-fade-in max-w-[1600px]">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>);
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'ANM' }, { label: 'Community Dashboard' }]} />
        <div className="flex items-center gap-2 text-sm font-bold text-warning-light bg-warning/10 px-4 py-2 rounded-lg border border-warning/30">
          <CloudOff className="w-4 h-4" /> OFFLINE SYNC ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[750px]">
        {/* Left: Patient List */}
        <div className="lg:col-span-5 h-[600px] lg:h-full flex flex-col gap-5">
           <div className="flex-1">
             <ANMPatientCards patients={d.patients} />
           </div>
        </div>
        
        {/* Right: Visit Form & Alerts */}
        <div className="lg:col-span-7 h-auto lg:h-full flex flex-col gap-5">
           <div className="flex-1">
             <ANMVisitRecording recentVisits={d.recentVisits} />
           </div>
           <div className="h-[250px]">
             <ANMAlertsPanel alerts={d.alerts} />
           </div>
        </div>
      </div>
    </div>
  );
}
