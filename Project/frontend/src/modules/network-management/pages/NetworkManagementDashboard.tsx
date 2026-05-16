'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ManagedDevicesPanel } from '../components/ManagedDevicesPanel';
import { DeviceMetricsPanel } from '../components/DeviceMetricsPanel';
import { NetworkTopologyPanel } from '../components/NetworkTopologyPanel';
import { FaultEventsPanel } from '../components/FaultEventsPanel';
import { useNetworkManagement } from '../hooks/useNetworkManagement';
import { Router, Activity, AlertTriangle, Cpu, Globe, Server } from 'lucide-react';

interface NetMgmtKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function NetMgmtKPICard({ kpi }: { kpi: NetMgmtKPI }) {
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
        <div className="p-2 rounded-lg bg-emerald-500/15"><Icon className="w-4 h-4 text-emerald-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const NetworkManagementDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useManagedDevices } = useNetworkManagement();
  const devicesQuery = useManagedDevices();

  useEffect(() => {
    setPageMeta('Network Management', 'Core hospital infrastructure — switches, routers, and firewalls');
  }, [setPageMeta]);

  if (devicesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: NetMgmtKPI[] = [
    { id: 'devices', title: 'Managed Devices', value: 842, status: 'success', icon: Router, subtitle: 'Switches, routers, APs' },
    { id: 'health', title: 'Network Health', value: '98.5%', status: 'success', icon: Activity, subtitle: 'Overall uptime' },
    { id: 'faults', title: 'Active Faults', value: 3, status: 'warning', icon: AlertTriangle, subtitle: 'Requires attention' },
    { id: 'cpu', title: 'Avg Device CPU', value: '34%', status: 'normal', icon: Cpu, subtitle: 'Across core devices' },
    { id: 'wan', title: 'WAN Links', value: 12, status: 'success', icon: Globe, subtitle: 'All uplinks online' },
    { id: 'servers', title: 'DHCP/DNS Servers', value: 8, status: 'success', icon: Server, subtitle: 'Active IP services' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Network' }, { label: 'Device Management' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <Router className="w-3.5 h-3.5" />
          INFRASTRUCTURE MANAGEMENT
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <NetMgmtKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <ManagedDevicesPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <NetworkTopologyPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <DeviceMetricsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <FaultEventsPanel />
        </div>
      </div>
    </div>
  );
};
