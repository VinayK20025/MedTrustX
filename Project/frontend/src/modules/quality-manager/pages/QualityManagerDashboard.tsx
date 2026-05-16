'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { QualityInsightsPanel } from '../components/QualityInsightsPanel';
import { QualityWorkspace } from '../components/QualityWorkspace';
import { useQualityManagerDashboard } from '../hooks/useQualityManagerAnalytics';
import type { QualityKPI } from '../types/quality-manager.types';
import { FileCheck2, TrendingUp, TrendingDown, Minus, ShieldAlert } from 'lucide-react';

function QmKPICard({ kpi }: { kpi: QualityKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  const trendColor = kpi.trend === 'up' && kpi.status === 'success' ? 'text-success-light' : 
                     kpi.trend === 'up' && kpi.status !== 'success' ? 'text-emergency-light' : 
                     kpi.trend === 'down' && kpi.status === 'success' ? 'text-success-light' :
                     kpi.trend === 'down' && kpi.status !== 'success' ? 'text-warning-light' : 'text-gray-500';

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
        <div className={cn('flex items-center gap-1 text-[11px] font-bold', trendColor)}>
          <TrendIcon className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

export function QualityManagerDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useQualityManagerDashboard({});

  useEffect(() => {
    setPageMeta('Quality Manager', 'Hospital governance, compliance, and continuous quality improvement (CQI)');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const sentinelEvent = d.incidents.find(i => i.severity === 'Sentinel');

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* SENTINEL EVENT BANNER */}
      {sentinelEvent && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">SENTINEL EVENT REPORTED</span>
            <p className="text-[11px] text-red-300 mt-0.5">{sentinelEvent.type} reported in {sentinelEvent.department}. Immediate RCA required per NABH guidelines.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Hospital Admin' }, { label: 'Quality & Governance' }]} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <QmKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-8 h-full">
          <QualityWorkspace audits={d.audits} incidents={d.incidents} capas={d.capas} />
        </div>
        <div className="xl:col-span-4 h-full">
          <QualityInsightsPanel alerts={d.alerts} scorecards={d.scorecards} />
        </div>
      </div>
    </div>
  );
}
