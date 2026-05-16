'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { EmergencyCasePanel } from '../components/EmergencyCasePanel';
import { CodeResponseWorkspace } from '../components/CodeResponseWorkspace';
import { EmergencyVitalsPanel } from '../components/EmergencyVitalsPanel';
import { useERParamedicDashboard } from '../hooks/useERParamedicAnalytics';
import type { ERParamedicKPI } from '../types/er-paramedic.types';
import { Siren, Activity } from 'lucide-react';

function ErKPICard({ kpi }: { kpi: ERParamedicKPI }) {
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

export function ERParamedicDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useERParamedicDashboard({});

  useEffect(() => {
    setPageMeta('ER Paramedic', 'Code response team, rapid patient stabilization, and ACLS protocol execution');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const isCodeActive = !!d.activeCode;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {isCodeActive && (
        <div className="bg-red-600/20 border border-red-600/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <Siren className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-red-500 uppercase tracking-widest">RAPID RESPONSE DEPLOYED</span>
            <p className="text-[11px] text-red-200 mt-0.5">{d.activeCode?.codeType} ongoing at {d.activeCode?.location}. Adhere strictly to BLS/ACLS algorithms.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Emergency Department' }, { label: 'Code Response Team' }]} />
        <div className="text-[12px] font-bold text-red-400 flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/25">
          <Activity className="w-4 h-4" /> Priority Override Mode Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {d.kpis.map(k => <ErKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-3 h-full">
          <EmergencyCasePanel code={d.activeCode} />
        </div>
        <div className="xl:col-span-6 h-full">
          <CodeResponseWorkspace protocols={d.protocolSteps} />
        </div>
        <div className="xl:col-span-3 h-full">
          <EmergencyVitalsPanel vitals={d.vitals} logs={d.logs} />
        </div>
      </div>
    </div>
  );
}
