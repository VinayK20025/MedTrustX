'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AmbulanceDispatchPanel } from '../components/AmbulanceDispatchPanel';
import { AmbulanceNavigationWorkspace } from '../components/AmbulanceNavigationWorkspace';
import { useAmbulanceDashboard } from '../hooks/useAmbulanceAnalytics';
import type { AmbulanceKPI } from '../types/ambulance.types';
import { RadioReceiver, AlertTriangle } from 'lucide-react';

function AmbKPICard({ kpi }: { kpi: AmbulanceKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
      </div>
    </div>
  );
}

export function AmbulanceDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useAmbulanceDashboard({});

  useEffect(() => {
    setPageMeta('Ambulance Driver', 'Emergency pre-hospital dispatch, live GPS navigation, and ER coordination');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const isCriticalDispatch = d.activeDispatch && d.activeDispatch.priority === 'Critical';

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {isCriticalDispatch && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">CRITICAL DISPATCH ACTIVE</span>
            <p className="text-[11px] text-red-300 mt-0.5">Time-critical patient extraction underway. Sirens authorized. ER standby has been notified.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Emergency Services' }, { label: 'Ambulance Unit' }]} />
        <div className="text-[12px] font-bold text-blue-400 flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <RadioReceiver className="w-4 h-4" /> Connected to Dispatch Center
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <AmbKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <AmbulanceDispatchPanel dispatch={d.activeDispatch} />
        </div>
        <div className="xl:col-span-8 h-full">
          <AmbulanceNavigationWorkspace dispatch={d.activeDispatch} />
        </div>
      </div>
    </div>
  );
}
