'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { LogStreamsPanel } from '../components/LogStreamsPanel';
import { LogEntriesPanel } from '../components/LogEntriesPanel';
import { LogIndexPanel } from '../components/LogIndexPanel';
import { useLoki } from '../hooks/useLoki';
import { FileText, Activity, AlertTriangle, Database, Clock, Search } from 'lucide-react';

interface LokiKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  icon: React.ElementType;
  subtitle?: string;
}

function LokiKPICard({ kpi }: { kpi: LokiKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40',
    normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover',
      statusColors[kpi.status]
    )}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-amber-500/15"><Icon className="w-4 h-4 text-amber-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>
        {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
      </p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const LokiDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useStreams } = useLoki();
  const streamsQuery = useStreams();

  useEffect(() => {
    setPageMeta('Loki Logging', 'Centralized log aggregation and analysis for all DHOS microservices');
  }, [setPageMeta]);

  if (streamsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: LokiKPI[] = [
    { id: 'ingestion', title: 'Log Ingestion Rate', value: '14.2K/s', status: 'normal', icon: Activity, subtitle: 'Lines per second' },
    { id: 'streams', title: 'Active Streams', value: 347, status: 'success', icon: FileText, subtitle: 'From 139 services' },
    { id: 'storage', title: 'Storage Used', value: '1.8 TB', status: 'normal', icon: Database, subtitle: '30-day retention' },
    { id: 'errors', title: 'Error Log Volume', value: '2.3%', status: 'warning', icon: AlertTriangle, subtitle: 'Of total log volume' },
    { id: 'latency', title: 'Query P99 Latency', value: '340ms', status: 'normal', icon: Clock, subtitle: 'LogQL queries' },
    { id: 'queries', title: 'Active Queries', value: 18, status: 'success', icon: Search, subtitle: 'Running queries' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Loki Logging' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/25">
          <FileText className="w-3.5 h-3.5" />
          LOG AGGREGATION ENGINE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <LokiKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <LogStreamsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <LogIndexPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <LogEntriesPanel />
      </div>
    </div>
  );
};
