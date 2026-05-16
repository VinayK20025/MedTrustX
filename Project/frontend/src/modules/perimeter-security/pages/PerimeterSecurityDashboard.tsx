'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PerimeterZonesPanel } from '../components/PerimeterZonesPanel';
import { SensorsPanel } from '../components/SensorsPanel';
import { IntrusionEventsPanel } from '../components/IntrusionEventsPanel';
import { ResponseActionsPanel } from '../components/ResponseActionsPanel';
import { usePerimeterSecurity } from '../hooks/usePerimeterSecurity';
import { ShieldAlert, Video, Map, Radio, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PerimeterKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function PerimeterKPICard({ kpi }: { kpi: PerimeterKPI }) {
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
        <div className="p-2 rounded-lg bg-orange-500/15"><Icon className="w-4 h-4 text-orange-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const PerimeterSecurityDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useZones } = usePerimeterSecurity();
  const zonesQuery = useZones();

  useEffect(() => {
    setPageMeta('Perimeter Security', 'Physical campus perimeter monitoring, fence lines, and external sensors');
  }, [setPageMeta]);

  if (zonesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: PerimeterKPI[] = [
    { id: 'zones', title: 'Secured Zones', value: 12, status: 'success', icon: Map, subtitle: 'Campus perimeter' },
    { id: 'sensors', title: 'Active Sensors', value: 342, status: 'success', icon: Radio, subtitle: 'Motion, thermal, LiDAR' },
    { id: 'cams', title: 'Perimeter Cameras', value: 84, status: 'normal', icon: Video, subtitle: 'PTZ & fixed' },
    { id: 'events', title: 'Intrusion Events', value: 1, status: 'warning', icon: AlertTriangle, subtitle: 'Last 24h' },
    { id: 'threats', title: 'Active Threats', value: 0, status: 'success', icon: ShieldAlert, subtitle: 'Verified intrusions' },
    { id: 'status', title: 'System Status', value: 'Armed', status: 'success', icon: ShieldCheck, subtitle: 'All zones active' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Perimeter Security' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-orange-300 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
          <ShieldAlert className="w-3.5 h-3.5" />
          PHYSICAL PERIMETER
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <PerimeterKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <PerimeterZonesPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <SensorsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <IntrusionEventsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <ResponseActionsPanel />
        </div>
      </div>
    </div>
  );
};
