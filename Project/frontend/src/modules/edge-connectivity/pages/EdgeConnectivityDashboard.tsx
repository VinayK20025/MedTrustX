'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { EdgeNodesPanel } from '../components/EdgeNodesPanel';
import { ConnectivitySessionsPanel } from '../components/ConnectivitySessionsPanel';
import { LinkMetricsPanel } from '../components/LinkMetricsPanel';
import { SyncLogsPanel } from '../components/SyncLogsPanel';
import { useEdgeConnectivity } from '../hooks/useEdgeConnectivity';
import { Radio, Wifi, Activity, Server, Clock, Shield } from 'lucide-react';

interface EdgeKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function EdgeKPICard({ kpi }: { kpi: EdgeKPI }) {
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
        <div className="p-2 rounded-lg bg-teal-500/15"><Icon className="w-4 h-4 text-teal-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const EdgeConnectivityDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useNodes } = useEdgeConnectivity();
  const nodesQuery = useNodes();

  useEffect(() => {
    setPageMeta('Edge Connectivity', 'IoT/IoMT edge node management, WAN links, and data synchronization');
  }, [setPageMeta]);

  if (nodesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: EdgeKPI[] = [
    { id: 'nodes', title: 'Edge Nodes', value: 24, status: 'success', icon: Server, subtitle: '24/24 connected' },
    { id: 'sessions', title: 'Active Sessions', value: 187, status: 'normal', icon: Wifi, subtitle: 'Device connections' },
    { id: 'bandwidth', title: 'WAN Throughput', value: '840 Mbps', status: 'normal', icon: Activity, subtitle: 'Aggregate bandwidth' },
    { id: 'latency', title: 'Edge Latency', value: '8ms', status: 'success', icon: Clock, subtitle: 'Avg node round-trip' },
    { id: 'sync', title: 'Data Sync', value: '99.97%', status: 'success', icon: Radio, subtitle: 'Consistency score' },
    { id: 'encrypted', title: 'Encrypted Links', value: '100%', status: 'success', icon: Shield, subtitle: 'mTLS enforced' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Network' }, { label: 'Edge Connectivity' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-teal-300 bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/25">
          <Radio className="w-3.5 h-3.5" />
          EDGE CONNECTIVITY MANAGER
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <EdgeKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <EdgeNodesPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <ConnectivitySessionsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <LinkMetricsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <SyncLogsPanel />
        </div>
      </div>
    </div>
  );
};
