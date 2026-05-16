'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AssetsPanel } from '../components/AssetsPanel';
import { TagsPanel } from '../components/TagsPanel';
import { LocationsPanel } from '../components/LocationsPanel';
import { MovementEventsPanel } from '../components/MovementEventsPanel';
import { useAssetTracking } from '../hooks/useAssetTracking';
import { Box, Tag, MapPin, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AssetKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function AssetKPICard({ kpi }: { kpi: AssetKPI }) {
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

export const AssetTrackingDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useAssets } = useAssetTracking();
  const assetsQuery = useAssets();

  useEffect(() => {
    setPageMeta('Asset Tracking', 'RTLS tracking, inventory lifecycle, and equipment management');
  }, [setPageMeta]);

  if (assetsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: AssetKPI[] = [
    { id: 'assets', title: 'Tracked Assets', value: '14.2K', status: 'success', icon: Box, subtitle: 'Medical & IT equipment' },
    { id: 'tags', title: 'Active RTLS Tags', value: '12.4K', status: 'normal', icon: Tag, subtitle: 'RFID / BLE beacons' },
    { id: 'locations', title: 'Mapped Locations', value: 342, status: 'success', icon: MapPin, subtitle: 'Rooms & Zones' },
    { id: 'movements', title: 'Daily Movements', value: '8.4K', status: 'normal', icon: Activity, subtitle: 'Asset transfers' },
    { id: 'lost', title: 'Missing Assets', value: 14, status: 'warning', icon: AlertTriangle, subtitle: 'Last seen > 7 days' },
    { id: 'maintenance', title: 'PM Compliance', value: '98.5%', status: 'success', icon: ShieldCheck, subtitle: 'Preventative maintenance' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Asset Tracking' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-teal-300 bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/25">
          <Tag className="w-3.5 h-3.5" />
          RTLS MANAGEMENT
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <AssetKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <AssetsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <MovementEventsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <TagsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <LocationsPanel />
        </div>
      </div>
    </div>
  );
};
