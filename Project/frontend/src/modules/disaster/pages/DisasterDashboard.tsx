'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { IncidentControlPanel } from '../components/IncidentControlPanel';
import { CommandCenterWorkspace } from '../components/CommandCenterWorkspace';
import { useDisasterDashboard } from '../hooks/useDisasterAnalytics';
import type { DisasterKPI } from '../types/disaster.types';
import { Siren, AlertTriangle, Radio } from 'lucide-react';

function DisasterKPICard({ kpi }: { kpi: DisasterKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 shadow-glass-sm flex flex-col justify-between bg-black/40 backdrop-blur', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
        {kpi.label}
      </p>
      <p className={cn('text-3xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value}</p>
      {kpi.subLabel && <p className={cn('text-[10px] mt-1', kpi.status === 'critical' ? 'text-emergency-light/70' : 'text-gray-500')}>{kpi.subLabel}</p>}
    </div>
  );
}

export function DisasterDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useDisasterDashboard({});
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setPageMeta('Disaster Management', 'Life-critical command — incident activation, resource control, and hospital recovery');
  }, [setPageMeta]);

  // Live elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[660px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const isDisasterActive = !!d.activeIncident;

  return (
    <div className={cn('space-y-4 animate-fade-in max-w-[1800px] relative', isDisasterActive ? 'disaster-mode' : '')}>

      {/* DISASTER MODE FULL-WIDTH BANNER */}
      {isDisasterActive && (
        <div className="bg-emergency/30 border border-emergency/50 rounded-xl px-6 py-3.5 flex items-center gap-3 shadow-lg shadow-emergency/20 animate-pulse">
          <Siren className="w-6 h-6 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[13px] font-black text-emergency-light uppercase tracking-widest">🚨 DISASTER MODE ACTIVE — {d.activeIncident!.code}</span>
            <p className="text-[11px] text-red-300/80 mt-0.5">{d.activeIncident!.title}</p>
          </div>
          <div className="text-[11px] font-mono text-emergency-light shrink-0 bg-black/30 px-3 py-1 rounded border border-emergency/30">
            LIVE ● REFRESHING 3s
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Disaster Command' }]} />
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-lg border',
            isDisasterActive ? 'text-emergency-light bg-emergency/10 border-emergency/30 animate-pulse' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
          )}>
            <Radio className="w-3.5 h-3.5" />
            {isDisasterActive ? 'EMERGENCY COMMAND' : 'STANDBY — NORMAL OPS'}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <DisasterKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main 2-panel layout: Incident control + Command center */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 h-[700px]">
          <IncidentControlPanel incident={d.activeIncident} />
        </div>
        <div className="xl:col-span-8 h-[700px]">
          <CommandCenterWorkspace zones={d.zoneStates} resources={d.resources} tasks={d.tasks} />
        </div>
      </div>
    </div>
  );
}
