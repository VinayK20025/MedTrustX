'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { WorkflowsPanel } from '../components/WorkflowsPanel';
import { WorkflowRunsPanel } from '../components/WorkflowRunsPanel';
import { TasksPanel } from '../components/TasksPanel';
import { BotsPanel } from '../components/BotsPanel';
import { useAutomationRpa } from '../hooks/useAutomationRpa';
import { Bot, Workflow, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface RpaKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function RpaKPICard({ kpi }: { kpi: RpaKPI }) {
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
        <div className="p-2 rounded-lg bg-cyan-500/15"><Icon className="w-4 h-4 text-cyan-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const RpaDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useWorkflows } = useAutomationRpa();
  const workflowsQuery = useWorkflows();

  useEffect(() => {
    setPageMeta('Automation & RPA', 'Robotic Process Automation and intelligent workflow orchestration');
  }, [setPageMeta]);

  if (workflowsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: RpaKPI[] = [
    { id: 'bots', title: 'Active Bots', value: 42, status: 'success', icon: Bot, subtitle: 'Workers deployed' },
    { id: 'workflows', title: 'RPA Workflows', value: 128, status: 'normal', icon: Workflow, subtitle: 'Automated processes' },
    { id: 'success', title: 'Success Rate', value: '98.5%', status: 'success', icon: CheckCircle, subtitle: 'Last 7 days' },
    { id: 'time', title: 'Hours Saved', value: '1.4K', status: 'success', icon: Clock, subtitle: 'Estimated FTE savings (Mo)' },
    { id: 'runs', title: 'Executions (24h)', value: '8.4K', status: 'normal', icon: Activity, subtitle: 'Total runs' },
    { id: 'failures', title: 'Failed Runs', value: 12, status: 'warning', icon: AlertTriangle, subtitle: 'Requires intervention' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Automation & RPA' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/25">
          <Bot className="w-3.5 h-3.5" />
          ROBOTIC PROCESS AUTOMATION
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <RpaKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <WorkflowRunsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <BotsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <WorkflowsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <TasksPanel />
        </div>
      </div>
    </div>
  );
};
