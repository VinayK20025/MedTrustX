'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AccessPointsPanel } from '../components/AccessPointsPanel';
import { CredentialsPanel } from '../components/CredentialsPanel';
import { AccessPoliciesPanel } from '../components/AccessPoliciesPanel';
import { AccessLogsPanel } from '../components/AccessLogsPanel';
import { usePhysicalAccess } from '../hooks/usePhysicalAccess';
import { Lock, Fingerprint, DoorClosed, AlertTriangle, Users, FileKey } from 'lucide-react';

interface PhysicalAccessKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function PhysicalAccessKPICard({ kpi }: { kpi: PhysicalAccessKPI }) {
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
        <div className="p-2 rounded-lg bg-red-500/15"><Icon className="w-4 h-4 text-red-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const PhysicalAccessDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useAccessPoints } = usePhysicalAccess();
  const apQuery = useAccessPoints();

  useEffect(() => {
    setPageMeta('Physical Access Control', 'PACS management for doors, turnstiles, badges, and biometrics');
  }, [setPageMeta]);

  if (apQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: PhysicalAccessKPI[] = [
    { id: 'doors', title: 'Managed Doors', value: 1248, status: 'success', icon: DoorClosed, subtitle: 'Access points' },
    { id: 'badges', title: 'Active Badges', value: '4.2K', status: 'normal', icon: Lock, subtitle: 'RFID / NFC' },
    { id: 'biometrics', title: 'Biometric Reads', value: '18.4K', status: 'success', icon: Fingerprint, subtitle: 'Last 24h authentications' },
    { id: 'denials', title: 'Access Denials', value: 47, status: 'warning', icon: AlertTriangle, subtitle: 'Invalid/expired attempts' },
    { id: 'guests', title: 'Guest Passes', value: 183, status: 'normal', icon: Users, subtitle: 'Temporary access' },
    { id: 'policies', title: 'Access Policies', value: 142, status: 'success', icon: FileKey, subtitle: 'Role-based access rules' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Physical Access Control' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/25">
          <DoorClosed className="w-3.5 h-3.5" />
          PACS MANAGEMENT
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <PhysicalAccessKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <AccessPointsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <CredentialsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <AccessPoliciesPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <AccessLogsPanel />
        </div>
      </div>
    </div>
  );
};
