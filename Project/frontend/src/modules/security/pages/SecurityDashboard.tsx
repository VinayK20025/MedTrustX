'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ZoneMapPanel } from '../components/ZoneMapPanel';
import { SurveillanceWorkspace } from '../components/SurveillanceWorkspace';
import { GuardStatusPanel } from '../components/GuardStatusPanel';
import { useSecurityDashboard } from '../hooks/useSecurityAnalytics';
import type { SecurityKPI } from '../types/security.types';
import { AlertTriangle, ShieldAlert, Radio } from 'lucide-react';

function SecurityKPICard({ kpi }: { kpi: SecurityKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}
        {kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function SecurityDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useSecurityDashboard({});

  useEffect(() => {
    setPageMeta('Security Manager', 'Physical security command — zone monitoring, CCTV, and incident response');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const hasHighAlert = d.incidents.some(i => i.severity === 'High' && i.status !== 'Resolved');

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Security Command' }]} />
        <div className="flex items-center gap-3">
          {hasHighAlert && (
            <span className="text-[10px] bg-emergency/20 text-emergency-light px-3 py-1.5 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> SECURITY INCIDENT ACTIVE
            </span>
          )}
          <div className="flex items-center gap-2 text-[11px] font-bold text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/25">
            <Radio className="w-3.5 h-3.5" /> LIVE COMMAND
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <SecurityKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Main 3-panel layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[680px]">
          <ZoneMapPanel zones={d.zones} />
        </div>
        <div className="xl:col-span-6 h-[680px]">
          <SurveillanceWorkspace incidents={d.incidents} cameras={d.cameras} guards={d.guards} />
        </div>
        <div className="xl:col-span-3 h-[680px]">
          <GuardStatusPanel guards={d.guards} />
        </div>
      </div>
    </div>
  );
}
