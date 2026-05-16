'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { NetworksPanel } from '../components/NetworksPanel';
import { SubnetsPanel } from '../components/SubnetsPanel';
import { IPAllocationsPanel } from '../components/IPAllocationsPanel';
import { ProvisionedDevicesPanel } from '../components/ProvisionedDevicesPanel';
import { useNetworkProvisioning } from '../hooks/useNetworkProvisioning';
import { Network, Server, Globe, Box, PlusCircle, CheckCircle } from 'lucide-react';

interface NetProvKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function NetProvKPICard({ kpi }: { kpi: NetProvKPI }) {
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

export const NetworkProvisioningDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useNetworks } = useNetworkProvisioning();
  const networksQuery = useNetworks();

  useEffect(() => {
    setPageMeta('Network Provisioning', 'VLANs, Subnets, and automated IP Address Management (IPAM)');
  }, [setPageMeta]);

  if (networksQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: NetProvKPI[] = [
    { id: 'networks', title: 'Managed Networks', value: 38, status: 'success', icon: Network, subtitle: 'Active VLAN segments' },
    { id: 'subnets', title: 'Allocated Subnets', value: 142, status: 'normal', icon: Box, subtitle: 'IPv4 / IPv6 blocks' },
    { id: 'ips', title: 'IP Utilization', value: '42%', status: 'success', icon: Server, subtitle: 'Of available space' },
    { id: 'devices', title: 'Provisioned Devices', value: '12.4K', status: 'normal', icon: Globe, subtitle: 'DHCP leases' },
    { id: 'requests', title: 'Pending Requests', value: 5, status: 'warning', icon: PlusCircle, subtitle: 'IP allocations' },
    { id: 'automation', title: 'Auto-Provisioning', value: '99.4%', status: 'success', icon: CheckCircle, subtitle: 'Success rate' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Network' }, { label: 'Provisioning' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <Network className="w-3.5 h-3.5" />
          IPAM & VLAN MANAGEMENT
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <NetProvKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <NetworksPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <SubnetsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <IPAllocationsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <ProvisionedDevicesPanel />
        </div>
      </div>
    </div>
  );
};
