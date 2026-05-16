'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { CompositionRoutesPanel } from '../components/CompositionRoutesPanel';
import { ApiCompositionsPanel } from '../components/ApiCompositionsPanel';
import { CompositionLogsPanel } from '../components/CompositionLogsPanel';
import { useCompositionAnalytics, useCircuitStates, useServiceRegistry } from '../hooks/useCompositionGateway';
import { Combine, Layers, Zap, Timer, Shield, Activity, ShieldAlert } from 'lucide-react';

interface ApiCompKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function ApiCompKPICard({ kpi }: { kpi: ApiCompKPI }) {
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
        <div className="p-2 rounded-lg bg-indigo-500/15"><Icon className="w-4 h-4 text-indigo-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const ApiCompositionDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const analyticsQuery = useCompositionAnalytics();
  const circuitsQuery = useCircuitStates();
  const registryQuery = useServiceRegistry();

  useEffect(() => {
    setPageMeta('API Composition', 'Backend-for-Frontend aggregator for cross-service data composition');
  }, [setPageMeta]);

  if (analyticsQuery.isLoading || registryQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const analytics = analyticsQuery.data;
  const circuits = circuitsQuery.data;
  const registry = registryQuery.data;

  const openCircuits = Object.values(circuits || {}).filter(state => state !== 'CLOSED').length;
  const endpointsCount = analytics?.top_endpoints?.length || 0;

  const kpis: ApiCompKPI[] = [
    { id: 'endpoints', title: 'Composed Endpoints', value: endpointsCount, status: 'success', icon: Combine, subtitle: 'Active BFF routes' },
    { id: 'pipelines', title: 'Microservices', value: registry?.length || 0, status: 'normal', icon: Layers, subtitle: 'Registered backends' },
    { id: 'latency', title: 'Avg Composition Time', value: `${analytics?.avg_composition_latency_ms || 0}ms`, status: (analytics?.avg_composition_latency_ms || 0) < 200 ? 'success' : 'warning', icon: Timer, subtitle: 'End-to-end aggregation' },
    { id: 'throughput', title: 'Request Rate', value: `${((analytics?.requests_per_hour || 0) / 3600).toFixed(1)}/s`, status: 'normal', icon: Zap, subtitle: 'Composed API calls' },
    { id: 'circuit', title: 'Circuit Breaker', value: openCircuits === 0 ? 'Closed' : `${openCircuits} Open`, status: openCircuits === 0 ? 'success' : 'warning', icon: openCircuits === 0 ? Shield : ShieldAlert, subtitle: openCircuits === 0 ? 'All backends healthy' : 'Degraded mode' },
    { id: 'errors', title: 'Composition Errors', value: `${analytics?.error_rate_pct || 0}%`, status: (analytics?.error_rate_pct || 0) < 1 ? 'success' : 'critical', icon: Activity, subtitle: 'Last 24h rate' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'API Composition' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <Combine className="w-3.5 h-3.5" />
          API AGGREGATION LAYER
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <ApiCompKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <CompositionRoutesPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <ApiCompositionsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <CompositionLogsPanel />
      </div>
    </div>
  );
};
