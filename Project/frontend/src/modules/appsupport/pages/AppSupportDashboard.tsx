'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { IncidentQueuePanel } from '../components/IncidentQueuePanel';
import { SupportWorkspace } from '../components/SupportWorkspace';
import { ImpactPanel } from '../components/ImpactPanel';
import { useAppSupportDashboard } from '../hooks/useAppSupportAnalytics';
import type { AppSupportFilters } from '../services/appsupport.api';
import type { AppSupportKPI, AppHealth } from '../types/appsupport.types';
import { AlertTriangle, Server, Activity } from 'lucide-react';

function AppSupportKPICard({ kpi }: { kpi: AppSupportKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

function HealthGrid({ health }: { health: AppHealth[] }) {
  return (
    <div className="bg-surface-light border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 overflow-x-auto">
       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 shrink-0 border-r border-white/10 pr-4"><Server className="w-4 h-4 text-blue-400" /> App Health</span>
       {health.map(h => (
         <div key={h.appId} className="flex items-center gap-2 shrink-0 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
           <div className={cn("w-2 h-2 rounded-full", h.status === 'Healthy' ? "bg-emerald-400" : h.status === 'Warning' ? "bg-warning-light" : "bg-emergency-light animate-pulse")} />
           <span className="text-[11px] font-bold text-white">{h.name}</span>
           {h.status !== 'Healthy' && <span className="text-[9px] font-mono text-gray-400">({h.responseTimeMs}ms)</span>}
         </div>
       ))}
    </div>
  );
}

export function AppSupportDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<AppSupportFilters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data, isLoading } = useAppSupportDashboard(filters);

  useEffect(() => { setPageMeta('Application Support', 'Enterprise app monitoring, log traces, and release validation'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedIncident = d.incidents.find(i => i.id === selectedId);
  const hasSev1 = d.incidents.some(i => i.severity === 'Sev 1' && i.status !== 'Resolved');

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'IT Operations' }, { label: 'Application Support' }]} />
        <div className="flex items-center gap-3">
           {hasSev1 && <span className="text-[10px] bg-emergency/20 text-emergency-light px-3 py-1.5 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> SEV-1 ACTIVE</span>}
           <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
             <Activity className="w-3.5 h-3.5" /> APP TELEMETRY
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <AppSupportKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <HealthGrid health={d.healthGrid} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[600px]">
          <IncidentQueuePanel incidents={d.incidents} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-6 h-[600px]">
          <SupportWorkspace incident={selectedIncident} />
        </div>
        <div className="xl:col-span-3 h-[600px]">
          <ImpactPanel incident={selectedIncident} />
        </div>
      </div>
    </div>
  );
}
