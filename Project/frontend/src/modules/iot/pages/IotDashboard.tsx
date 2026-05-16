'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ConnectionsPanel } from '../components/ConnectionsPanel';
import { TopicsPanel } from '../components/TopicsPanel';
import { MessagesPanel } from '../components/MessagesPanel';
import { CommandsPanel } from '../components/CommandsPanel';
import { EventsPanel } from '../components/EventsPanel';
import { useIot } from '../hooks/useIot';
import { Radio, Wifi, Zap, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface IotKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function IotKPICard({ kpi }: { kpi: IotKPI }) {
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
        <div className="p-2 rounded-lg bg-blue-500/15"><Icon className="w-4 h-4 text-blue-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const IotDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useConnections } = useIot();
  const connQuery = useConnections();

  useEffect(() => {
    setPageMeta('IoT Edge Connectivity', 'IoMT device management, MQTT telemetry, and edge networking');
  }, [setPageMeta]);

  if (connQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: IotKPI[] = [
    { id: 'devices', title: 'Connected Devices', value: '18.4K', status: 'success', icon: Radio, subtitle: 'IoMT + Sensors' },
    { id: 'throughput', title: 'Msg Throughput', value: '1.2M/min', status: 'normal', icon: Zap, subtitle: 'Telemetry ingest' },
    { id: 'topics', title: 'Active Topics', value: 842, status: 'success', icon: Wifi, subtitle: 'MQTT pub/sub' },
    { id: 'latency', title: 'Avg Latency', value: '12ms', status: 'success', icon: Activity, subtitle: 'Edge to Core' },
    { id: 'drops', title: 'Connection Drops', value: 14, status: 'warning', icon: AlertTriangle, subtitle: 'Last 1 hour' },
    { id: 'security', title: 'mTLS Protected', value: '100%', status: 'success', icon: ShieldCheck, subtitle: 'Zero Trust verified' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'IoT Management' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <Radio className="w-3.5 h-3.5" />
          EDGE TELEMETRY
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <IotKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <ConnectionsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <TopicsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[400px]">
          <MessagesPanel />
        </div>
        <div className="xl:col-span-4 flex flex-col gap-5 h-[400px]">
          <div className="flex-1">
            <CommandsPanel />
          </div>
          <div className="flex-1">
            <EventsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
