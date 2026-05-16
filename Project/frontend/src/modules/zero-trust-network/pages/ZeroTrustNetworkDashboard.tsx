'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AccessPoliciesPanel } from '../components/AccessPoliciesPanel';
import { NetworkSessionsPanel } from '../components/NetworkSessionsPanel';
import { DevicePosturePanel } from '../components/DevicePosturePanel';
import { AccessDecisionsPanel } from '../components/AccessDecisionsPanel';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import { ShieldCheck, Network, Lock, AlertTriangle, MonitorSmartphone, Key } from 'lucide-react';

interface ZTAKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function ZTAKPICard({ kpi }: { kpi: ZTAKPI }) {
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

export const ZeroTrustNetworkDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { usePolicies } = useZeroTrustNetwork();
  const policiesQuery = usePolicies();

  useEffect(() => {
    setPageMeta('Zero Trust Network', 'Identity-aware micro-segmentation, continuous verification, and device posture');
  }, [setPageMeta]);

  if (policiesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: ZTAKPI[] = [
    { id: 'sessions', title: 'ZTA Sessions', value: '18.4K', status: 'success', icon: Network, subtitle: 'Active mTLS tunnels' },
    { id: 'policies', title: 'Access Policies', value: 342, status: 'normal', icon: Lock, subtitle: 'Identity + Context rules' },
    { id: 'devices', title: 'Compliant Devices', value: '98.5%', status: 'success', icon: MonitorSmartphone, subtitle: 'Posture checks passed' },
    { id: 'denials', title: 'Blocked Access', value: 489, status: 'warning', icon: AlertTriangle, subtitle: 'Last 24h denials' },
    { id: 'decisions', title: 'Policy Engine latency', value: '2ms', status: 'success', icon: ShieldCheck, subtitle: 'P99 evaluate time' },
    { id: 'certs', title: 'Short-Lived Certs', value: '24.1K', status: 'normal', icon: Key, subtitle: 'Issued today' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Zero Trust Network' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <ShieldCheck className="w-3.5 h-3.5" />
          ZERO TRUST ARCHITECTURE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <ZTAKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <NetworkSessionsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <AccessPoliciesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <DevicePosturePanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <AccessDecisionsPanel />
        </div>
      </div>
    </div>
  );
};
