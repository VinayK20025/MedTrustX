'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TopicViewsPanel } from '../components/TopicViewsPanel';
import { ConsumerGroupViewsPanel } from '../components/ConsumerGroupViewsPanel';
import { ConsoleSessionsPanel } from '../components/ConsoleSessionsPanel';
import { useRedpandaConsole } from '../hooks/useRedpandaConsole';
import { Monitor, Layers, Clock, Shield, Activity, GitBranch } from 'lucide-react';

interface ConsoleKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function ConsoleKPICard({ kpi }: { kpi: ConsoleKPI }) {
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
        <div className="p-2 rounded-lg bg-violet-500/15"><Icon className="w-4 h-4 text-violet-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const RedpandaConsoleDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useTopics } = useRedpandaConsole();
  const topicQuery = useTopics();

  useEffect(() => {
    setPageMeta('Redpanda Console', 'Visual management interface for streaming topics and schema registry');
  }, [setPageMeta]);

  if (topicQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: ConsoleKPI[] = [
    { id: 'topics', title: 'Managed Topics', value: 87, status: 'success', icon: Layers, subtitle: 'Browsable topics' },
    { id: 'schemas', title: 'Schema Registry', value: 142, status: 'normal', icon: GitBranch, subtitle: 'Avro/Protobuf schemas' },
    { id: 'lag', title: 'Consumer Lag Alerts', value: 3, status: 'warning', icon: Clock, subtitle: 'Groups behind' },
    { id: 'acls', title: 'ACL Policies', value: 56, status: 'success', icon: Shield, subtitle: 'Topic-level security' },
    { id: 'messages', title: 'Messages Browsed', value: '12.4K', status: 'normal', icon: Activity, subtitle: 'Last 24h inspections' },
    { id: 'status', title: 'Console Status', value: 'Healthy', status: 'success', icon: Monitor, subtitle: 'All systems nominal' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Redpanda Console' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-violet-300 bg-violet-500/10 px-4 py-2 rounded-lg border border-violet-500/25">
          <Monitor className="w-3.5 h-3.5" />
          STREAM MANAGEMENT CONSOLE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <ConsoleKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <TopicViewsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <ConsumerGroupViewsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <ConsoleSessionsPanel />
      </div>
    </div>
  );
};
