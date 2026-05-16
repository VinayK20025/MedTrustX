'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PipelinePanel } from '../components/PipelinePanel';
import { CoordinationWorkspace } from '../components/CoordinationWorkspace';
import { SupplyAlertsPanel } from '../components/SupplyAlertsPanel';
import { useSupplyChainDashboard } from '../hooks/useSupplyChainAnalytics';
import type { SupplyChainKPI } from '../types/supply-chain.types';
import { Network, ShieldAlert } from 'lucide-react';

function ScKPICard({ kpi }: { kpi: SupplyChainKPI }) {
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

export function SupplyChainDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useSupplyChainDashboard({});

  useEffect(() => {
    setPageMeta('Supply Chain Coordinator', 'Cross-module orchestration, pipeline visibility, and bottleneck resolution');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const criticalIssues = d.issues.filter(i => i.status === 'Open' && i.impact === 'High');

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {criticalIssues.length > 0 && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">CRITICAL SUPPLY CHAIN BOTTLENECK</span>
            <p className="text-[11px] text-red-300 mt-0.5">{criticalIssues.length} high-impact issue(s) detected in the pipeline. Immediate coordination required to prevent clinical stockouts.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Supply Chain Operations' }, { label: 'Pipeline Coordination' }]} />
        <div className="text-[12px] font-bold text-purple-400 flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/25">
          <Network className="w-4 h-4" /> Global Visibility Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <ScKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-3 h-full">
          <PipelinePanel pipeline={d.pipeline} />
        </div>
        <div className="xl:col-span-6 h-full">
          <CoordinationWorkspace orders={d.orders} vendors={d.vendors} />
        </div>
        <div className="xl:col-span-3 h-full">
          <SupplyAlertsPanel issues={d.issues} />
        </div>
      </div>
    </div>
  );
}
