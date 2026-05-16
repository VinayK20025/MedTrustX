'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { StreamTopicsPanel } from '../components/StreamTopicsPanel';
import { ConsumerOffsetsPanel } from '../components/ConsumerOffsetsPanel';
import { StreamMessagesPanel } from '../components/StreamMessagesPanel';
import { useRedpanda } from '../hooks/useRedpanda';
import { Radio, Activity, Layers, Zap, HardDrive, BarChart3 } from 'lucide-react';

interface RedpandaKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function RedpandaKPICard({ kpi }: { kpi: RedpandaKPI }) {
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
        <div className="p-2 rounded-lg bg-purple-500/15"><Icon className="w-4 h-4 text-purple-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const RedpandaDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useTopics } = useRedpanda();
  const topicsQuery = useTopics();

  useEffect(() => {
    setPageMeta('Redpanda Streaming', 'Event streaming platform for real-time clinical data pipelines');
  }, [setPageMeta]);

  if (topicsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: RedpandaKPI[] = [
    { id: 'topics', title: 'Active Topics', value: 87, status: 'success', icon: Layers, subtitle: 'Clinical + operational' },
    { id: 'throughput', title: 'Throughput', value: '42K msg/s', status: 'normal', icon: Zap, subtitle: 'Ingestion rate' },
    { id: 'consumers', title: 'Consumer Groups', value: 34, status: 'success', icon: Radio, subtitle: 'Active consumers' },
    { id: 'lag', title: 'Max Consumer Lag', value: 1240, status: 'warning', icon: Activity, subtitle: 'Messages behind' },
    { id: 'partitions', title: 'Partitions', value: 456, status: 'normal', icon: HardDrive, subtitle: 'Across all topics' },
    { id: 'brokers', title: 'Brokers', value: '5/5', status: 'success', icon: BarChart3, subtitle: 'All nodes healthy' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Redpanda Streaming' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/25">
          <Radio className="w-3.5 h-3.5" />
          EVENT STREAMING PLATFORM
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <RedpandaKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <StreamTopicsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <ConsumerOffsetsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <StreamMessagesPanel />
      </div>
    </div>
  );
};
