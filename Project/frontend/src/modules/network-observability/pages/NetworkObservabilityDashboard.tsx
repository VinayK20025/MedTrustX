'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { NetworkFlowsPanel } from '../components/NetworkFlowsPanel';
import { TrafficMetricsPanel } from '../components/TrafficMetricsPanel';
import { DependencyMapPanel } from '../components/DependencyMapPanel';
import { AnomaliesPanel } from '../components/AnomaliesPanel';
import { useNetworkObservability } from '../hooks/useNetworkObservability';
import { Activity, Network, AlertTriangle, ArrowRightLeft, ShieldAlert, Cpu } from 'lucide-react';

interface NetObsKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function NetObsKPICard({ kpi }: { kpi: NetObsKPI }) {
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

export const NetworkObservabilityDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useFlows } = useNetworkObservability();
  const flowsQuery = useFlows();

  useEffect(() => {
    setPageMeta('Network Observability', 'Deep packet inspection, flow analysis, and traffic visualization');
  }, [setPageMeta]);

  if (flowsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: NetObsKPI[] = [
    { id: 'throughput', title: 'Total Throughput', value: '18.4 Gbps', status: 'normal', icon: Activity, subtitle: 'East-West + North-South' },
    { id: 'flows', title: 'Active Flows', value: '1.2M', status: 'normal', icon: ArrowRightLeft, subtitle: 'TCP/UDP connections' },
    { id: 'anomalies', title: 'Detected Anomalies', value: 24, status: 'warning', icon: ShieldAlert, subtitle: 'Suspicious traffic patterns' },
    { id: 'latency', title: 'Avg Flow Latency', value: '4ms', status: 'success', icon: Network, subtitle: 'Internal network' },
    { id: 'drops', title: 'Packet Drop Rate', value: '0.01%', status: 'success', icon: AlertTriangle, subtitle: 'Healthy threshold' },
    { id: 'dpi', title: 'DPI Engine Load', value: '45%', status: 'normal', icon: Cpu, subtitle: 'Packet inspection clusters' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Network' }, { label: 'Observability' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/25">
          <Activity className="w-3.5 h-3.5" />
          FLOW & TRAFFIC ANALYSIS
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <NetObsKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <TrafficMetricsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <DependencyMapPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <NetworkFlowsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <AnomaliesPanel />
        </div>
      </div>
    </div>
  );
};
