'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { InfectionSurveillancePanel } from '../components/InfectionSurveillancePanel';
import { InfectionControlWorkspace } from '../components/InfectionControlWorkspace';
import { useInfectionControlDashboard } from '../hooks/useInfectionControlAnalytics';
import type { InfectionControlKPI } from '../types/infection-control.types';
import { Biohazard, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';

function InfectionKPICard({ kpi }: { kpi: InfectionControlKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 shadow-glass-sm flex flex-col justify-between bg-black/30', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3 animate-pulse" />}{kpi.label}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value}</p>
      {kpi.subLabel && <p className="text-[10px] text-gray-500 mt-1">{kpi.subLabel}</p>}
    </div>
  );
}

export function InfectionControlDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useInfectionControlDashboard({});
  const [selectedWard, setSelectedWard] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Infection Control Officer', 'Surveillance, outbreak containment, hygiene audits, and compliance tracking');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px]">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const hasOutbreak = d.outbreaks.length > 0;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px]">
      {/* OUTBREAK BANNER */}
      {hasOutbreak && (
        <div className="bg-emergency/25 border border-emergency/50 rounded-xl px-6 py-3.5 flex items-center gap-3 animate-pulse">
          <Biohazard className="w-6 h-6 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[13px] font-black text-emergency-light uppercase tracking-widest">🚨 OUTBREAK DETECTED — {d.outbreaks[0].ward} ({d.outbreaks[0].pathogen})</span>
            <p className="text-[11px] text-red-300 mt-0.5">Containment protocol activated. {d.outbreaks[0].caseCount} confirmed cases.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Clinical Admin' }, { label: 'Infection Control' }]} />
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-lg border',
            hasOutbreak ? 'text-emergency-light bg-emergency/10 border-emergency/30' : 'text-teal-300 bg-teal-500/10 border-teal-500/25'
          )}>
            <Radio className="w-3.5 h-3.5" />
            {hasOutbreak ? 'OUTBREAK RESPONSE MODE' : 'SURVEILLANCE ACTIVE'}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <InfectionKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[660px]">
          <InfectionSurveillancePanel wardSummaries={d.wardSummaries} cases={d.cases} selectedWard={selectedWard} onSelectWard={setSelectedWard} />
        </div>
        <div className="xl:col-span-7 h-[660px]">
          <InfectionControlWorkspace outbreaks={d.outbreaks} audits={d.audits} protocols={d.protocols} />
        </div>
      </div>
    </div>
  );
}
