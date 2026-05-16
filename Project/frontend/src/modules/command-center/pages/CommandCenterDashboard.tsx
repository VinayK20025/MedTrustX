'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { IncidentsPanel } from '../components/IncidentsPanel';
import { CommandsPanel } from '../components/CommandsPanel';
import { OperationalEventsPanel } from '../components/OperationalEventsPanel';
import { ControlSessionsPanel } from '../components/ControlSessionsPanel';
import { useCommandCenter } from '../hooks/useCommandCenter';
import { Shield, Activity, Target, Zap, AlertTriangle, MonitorPlay } from 'lucide-react';

interface CommandKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function CommandKPICard({ kpi }: { kpi: CommandKPI }) {
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
        <div className="p-2 rounded-lg bg-yellow-500/15"><Icon className="w-4 h-4 text-yellow-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const CommandCenterDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useIncidents } = useCommandCenter();
  const incidentsQuery = useIncidents();

  useEffect(() => {
    setPageMeta('Command Center', 'Hospital-wide operational control, critical events, and rapid response coordination');
  }, [setPageMeta]);

  if (incidentsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: CommandKPI[] = [
    { id: 'ops', title: 'Hospital Status', value: 'GREEN', status: 'success', icon: Shield, subtitle: 'All systems nominal' },
    { id: 'events', title: 'Active Events', value: 14, status: 'warning', icon: Activity, subtitle: 'Requires coordination' },
    { id: 'critical', title: 'Code Blue / Red', value: 0, status: 'success', icon: AlertTriangle, subtitle: 'Emergency triggers' },
    { id: 'commands', title: 'Issued Directives', value: 8, status: 'normal', icon: Target, subtitle: 'Pending completion' },
    { id: 'response', title: 'Avg Response Time', value: '3m 12s', status: 'success', icon: Zap, subtitle: 'Incident dispatch' },
    { id: 'sessions', title: 'Active Sessions', value: 4, status: 'normal', icon: MonitorPlay, subtitle: 'Live control rooms' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Command Center' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-yellow-300 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/25">
          <Target className="w-3.5 h-3.5" />
          HOSPITAL OPERATIONS
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <CommandKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <IncidentsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <CommandsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <OperationalEventsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <ControlSessionsPanel />
        </div>
      </div>
    </div>
  );
};
