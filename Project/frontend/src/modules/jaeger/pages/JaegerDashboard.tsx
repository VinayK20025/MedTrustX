'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TracesPanel } from '../components/TracesPanel';
import { SpansPanel } from '../components/SpansPanel';
import { DependenciesPanel } from '../components/DependenciesPanel';
import { useJaeger } from '../hooks/useJaeger';
import { Workflow, Activity, Timer, Layers, AlertTriangle, TrendingUp } from 'lucide-react';

interface JaegerKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function JaegerKPICard({ kpi }: { kpi: JaegerKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40', normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40', critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover', statusColors[kpi.status])}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-cyan-500/15"><Icon className="w-4 h-4 text-cyan-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const JaegerDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useTraces } = useJaeger();
  const tracesQuery = useTraces();

  useEffect(() => {
    setPageMeta('Jaeger Tracing', 'Distributed tracing for microservice observability and latency analysis');
  }, [setPageMeta]);

  if (tracesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: JaegerKPI[] = [
    { id: 'traces', title: 'Traces (24h)', value: '2.4M', status: 'normal', icon: Workflow, subtitle: 'Across all services' },
    { id: 'latency', title: 'P99 Latency', value: '245ms', status: 'success', icon: Timer, subtitle: 'Cross-service hops' },
    { id: 'services', title: 'Traced Services', value: 139, status: 'success', icon: Layers, subtitle: 'Full mesh coverage' },
    { id: 'errors', title: 'Error Traces', value: '0.8%', status: 'normal', icon: AlertTriangle, subtitle: 'Of total trace volume' },
    { id: 'spans', title: 'Avg Spans/Trace', value: 12.4, status: 'normal', icon: Activity, subtitle: 'Service depth' },
    { id: 'throughput', title: 'Throughput', value: '28K/s', status: 'success', icon: TrendingUp, subtitle: 'Spans ingested/sec' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Jaeger Tracing' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/25">
          <Workflow className="w-3.5 h-3.5" />
          DISTRIBUTED TRACING
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <JaegerKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <TracesPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <SpansPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <DependenciesPanel />
      </div>
    </div>
  );
};
