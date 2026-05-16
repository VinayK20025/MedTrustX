'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { SimulationsPanel } from '../components/SimulationsPanel';
import { ScenariosPanel } from '../components/ScenariosPanel';
import { SimulationResultsPanel } from '../components/SimulationResultsPanel';
import { SimulationEventsPanel } from '../components/SimulationEventsPanel';
import { useSimulation } from '../hooks/useSimulation';
import { FlaskConical, Target, ListTree, Activity, BarChart2, CheckCircle } from 'lucide-react';

interface SimulationKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function SimulationKPICard({ kpi }: { kpi: SimulationKPI }) {
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

export const SimulationDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useSimulations } = useSimulation();
  const simQuery = useSimulations();

  useEffect(() => {
    setPageMeta('Simulation Engine', 'Predictive modeling and scenario testing for clinical and operational workflows');
  }, [setPageMeta]);

  if (simQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: SimulationKPI[] = [
    { id: 'active', title: 'Active Simulations', value: 8, status: 'normal', icon: FlaskConical, subtitle: 'Currently running' },
    { id: 'scenarios', title: 'Scenarios Defined', value: 142, status: 'success', icon: ListTree, subtitle: 'Workflow variations' },
    { id: 'compute', title: 'Compute Load', value: '42%', status: 'success', icon: Activity, subtitle: 'Dedicated cluster' },
    { id: 'results', title: 'Results Generated', value: 34, status: 'normal', icon: BarChart2, subtitle: 'Last 7 days' },
    { id: 'accuracy', title: 'Model Accuracy', value: '94.2%', status: 'success', icon: Target, subtitle: 'Vs historical data' },
    { id: 'completed', title: 'Completed Runs', value: 890, status: 'success', icon: CheckCircle, subtitle: 'Lifetime total' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Simulation Engine' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/25">
          <FlaskConical className="w-3.5 h-3.5" />
          PREDICTIVE MODELING
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <SimulationKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <SimulationsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <ScenariosPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <SimulationEventsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <SimulationResultsPanel />
        </div>
      </div>
    </div>
  );
};
