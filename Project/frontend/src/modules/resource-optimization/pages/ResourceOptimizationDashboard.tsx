'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ResourcesPanel } from '../components/ResourcesPanel';
import { AllocationsPanel } from '../components/AllocationsPanel';
import { OptimizationRunsPanel } from '../components/OptimizationRunsPanel';
import { OptimizationResultsPanel } from '../components/OptimizationResultsPanel';
import { useResourceOptimization } from '../hooks/useResourceOptimization';
import { Cpu, Server, HardDrive, Settings, Activity, Clock } from 'lucide-react';

interface ResourceKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function ResourceKPICard({ kpi }: { kpi: ResourceKPI }) {
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

export const ResourceOptimizationDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useResources } = useResourceOptimization();
  const resQuery = useResources();

  useEffect(() => {
    setPageMeta('Resource Optimization', 'Compute, storage, and cloud cost efficiency management');
  }, [setPageMeta]);

  if (resQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: ResourceKPI[] = [
    { id: 'utilization', title: 'Overall Utilization', value: '78%', status: 'success', icon: Activity, subtitle: 'Compute cluster' },
    { id: 'cpu', title: 'CPU Cores', value: '342/500', status: 'normal', icon: Cpu, subtitle: 'Allocated cores' },
    { id: 'ram', title: 'Memory', value: '1.2/2 TB', status: 'normal', icon: Server, subtitle: 'Allocated RAM' },
    { id: 'storage', title: 'Storage', value: '84/100 TB', status: 'warning', icon: HardDrive, subtitle: 'Persistent volumes' },
    { id: 'savings', title: 'Projected Savings', value: '$12.4K', status: 'success', icon: Settings, subtitle: 'If recommendations applied' },
    { id: 'runs', title: 'Optimizer Runs', value: 24, status: 'normal', icon: Clock, subtitle: 'Last 24 hours' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Resource Optimization' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <Settings className="w-3.5 h-3.5" />
          COMPUTE & COST OPTIMIZATION
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <ResourceKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[450px]">
          <ResourcesPanel />
        </div>
        <div className="xl:col-span-6 h-[450px]">
          <AllocationsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <OptimizationRunsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <OptimizationResultsPanel />
        </div>
      </div>
    </div>
  );
};
