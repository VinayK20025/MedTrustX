'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { NetworkTopologyPanel } from '../components/NetworkTopologyPanel';
import { NetworkWorkspace } from '../components/NetworkWorkspace';
import { NetworkAlertsPanel } from '../components/NetworkAlertsPanel';
import { useNetworkDashboard } from '../hooks/useNetworkAnalytics';
import type { NetworkFilters } from '../services/network.api';
import type { NetworkKPI } from '../types/network.types';
import { Network, AlertTriangle, Activity } from 'lucide-react';

function NetworkKPICard({ kpi }: { kpi: NetworkKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function NetworkDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<NetworkFilters>({});
  const { data, isLoading } = useNetworkDashboard(filters);

  useEffect(() => { setPageMeta('Network Administrator', 'Real-time hospital network topology, bandwidth, and edge security'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const hasCriticalIncidents = d.incidents.some(i => i.severity === 'Critical' || i.severity === 'High');

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'IT Administration' }, { label: 'Network Operations' }]} />
        <div className="flex items-center gap-3">
           {hasCriticalIncidents && <span className="text-[10px] bg-emergency/20 text-emergency-light px-3 py-1.5 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> NETWORK DEGRADATION</span>}
           <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
             <Activity className="w-3.5 h-3.5" /> LIVE TELEMETRY
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <NetworkKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <NetworkTopologyPanel devices={d.devices} />
        </div>
        <div className="xl:col-span-6 h-[650px]">
          <NetworkWorkspace incidents={d.incidents} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          <NetworkAlertsPanel threats={d.threats} />
        </div>
      </div>
    </div>
  );
}
