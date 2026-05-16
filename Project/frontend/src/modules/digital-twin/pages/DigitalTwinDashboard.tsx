'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { DigitalTwinsPanel } from '../components/DigitalTwinsPanel';
import { TwinStatesPanel } from '../components/TwinStatesPanel';
import { TwinEventsPanel } from '../components/TwinEventsPanel';
import { TwinSimulationsPanel } from '../components/TwinSimulationsPanel';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import { Box, Layers, PlaySquare, AlertTriangle, MonitorPlay, Activity } from 'lucide-react';

interface TwinKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function TwinKPICard({ kpi }: { kpi: TwinKPI }) {
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

export const DigitalTwinDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useTwins } = useDigitalTwin();
  const twinsQuery = useTwins();

  useEffect(() => {
    setPageMeta('Digital Twin', 'Real-time virtual representations of hospital operations and assets');
  }, [setPageMeta]);

  if (twinsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: TwinKPI[] = [
    { id: 'twins', title: 'Active Twins', value: 842, status: 'success', icon: Box, subtitle: 'Assets & Facilities' },
    { id: 'sync', title: 'Sync Latency', value: '1.2s', status: 'success', icon: Activity, subtitle: 'Real-time state update' },
    { id: 'events', title: 'State Events', value: '14.2K', status: 'normal', icon: Layers, subtitle: 'Last 24 hours' },
    { id: 'anomalies', title: 'Drift Alerts', value: 3, status: 'warning', icon: AlertTriangle, subtitle: 'Physical/Virtual mismatch' },
    { id: 'sims', title: 'Running Sims', value: 12, status: 'normal', icon: PlaySquare, subtitle: 'Predictive modeling' },
    { id: 'viewers', title: 'Active Viewers', value: 34, status: 'success', icon: MonitorPlay, subtitle: 'Spatial dashboards' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Digital Twin' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <Box className="w-3.5 h-3.5" />
          VIRTUAL HOSPITAL MODEL
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <TwinKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <DigitalTwinsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <TwinSimulationsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <TwinStatesPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <TwinEventsPanel />
        </div>
      </div>
    </div>
  );
};
