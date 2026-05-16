'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { FireZoneMapPanel } from '../components/FireZoneMapPanel';
import { FireSafetyWorkspace } from '../components/FireSafetyWorkspace';
import { useFireSafetyDashboard } from '../hooks/useFireSafetyAnalytics';
import type { FireSafetyKPI } from '../types/fire-safety.types';
import { Flame, AlertTriangle, ShieldAlert, Radio } from 'lucide-react';

function FireKPICard({ kpi }: { kpi: FireSafetyKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 shadow-glass-sm flex flex-col justify-between bg-black/30', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3 animate-pulse" />}{kpi.label}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value}</p>
    </div>
  );
}

export function FireSafetyDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useFireSafetyDashboard({});

  useEffect(() => {
    setPageMeta('Fire Safety Officer', 'Fire prevention, alarm monitoring, emergency response, and compliance');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const hasFireAlert = d.zones.some(z => z.status === 'Fire Alert');
  const hasSmokeAlert = d.zones.some(z => z.status === 'Smoke Detected');

  return (
    <div className="space-y-4 animate-fade-in max-w-[1800px]">
      {/* FIRE MODE BANNER */}
      {hasFireAlert && (
        <div className="bg-emergency/25 border border-emergency/50 rounded-xl px-6 py-3 flex items-center gap-3 animate-pulse">
          <Flame className="w-5 h-5 text-emergency-light shrink-0" />
          <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">🔴 FIRE ALERT ACTIVE — ICU ZONE — IMMEDIATE RESPONSE REQUIRED</span>
        </div>
      )}
      {!hasFireAlert && hasSmokeAlert && (
        <div className="bg-warning/15 border border-warning/30 rounded-xl px-6 py-3 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-warning-light shrink-0 animate-pulse" />
          <span className="text-[12px] font-black text-warning-light uppercase tracking-widest">🟡 SMOKE DETECTED — Ward A — Investigation Underway</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Safety' }, { label: 'Fire Safety Command' }]} />
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-lg border',
            hasFireAlert ? 'text-emergency-light bg-emergency/10 border-emergency/30 animate-pulse' : 'text-orange-300 bg-orange-500/10 border-orange-500/25'
          )}>
            <Radio className="w-3.5 h-3.5" />
            {hasFireAlert ? 'CODE RED ACTIVE' : 'MONITORING ACTIVE'}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <FireKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main 3-panel layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[660px]">
          <FireZoneMapPanel zones={d.zones} />
        </div>
        <div className="xl:col-span-9 h-[660px]">
          <FireSafetyWorkspace incidents={d.incidents} equipment={d.equipment} compliance={d.compliance} />
        </div>
      </div>
    </div>
  );
}
