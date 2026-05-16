'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { StrategicPlanList } from '../components/StrategicPlanList';
import { ObjectivesList } from '../components/ObjectivesList';
import { InitiativesList } from '../components/InitiativesList';
import { ForecastPanel } from '../components/ForecastPanel';
import { useStrategicAnalytics } from '../hooks/useStrategicAnalytics';
import { Compass, Target, Map, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface StrategyKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function StrategyKPICard({ kpi }: { kpi: StrategyKPI }) {
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
        <div className="p-2 rounded-lg bg-indigo-500/15"><Icon className="w-4 h-4 text-indigo-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const StrategyDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { usePlans } = useStrategicAnalytics();
  const plansQuery = usePlans();

  useEffect(() => {
    setPageMeta('Strategic Planning', 'Hospital 3-5 year roadmaps, OKRs, and strategic initiative tracking');
  }, [setPageMeta]);

  if (plansQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: StrategyKPI[] = [
    { id: 'plans', title: 'Active Plans', value: 4, status: 'normal', icon: Map, subtitle: 'FY26-FY28 Roadmap' },
    { id: 'objectives', title: 'Strategic OKRs', value: 24, status: 'normal', icon: Target, subtitle: 'Across all departments' },
    { id: 'progress', title: 'Overall Progress', value: '68%', status: 'success', icon: TrendingUp, subtitle: 'On track' },
    { id: 'initiatives', title: 'Key Initiatives', value: 56, status: 'normal', icon: Compass, subtitle: 'Projects in flight' },
    { id: 'risks', title: 'Strategic Risks', value: 3, status: 'warning', icon: AlertTriangle, subtitle: 'Requires mitigation' },
    { id: 'horizon', title: 'Planning Horizon', value: '3 Years', status: 'normal', icon: Calendar, subtitle: 'Current cycle' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Strategic Planning' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <Map className="w-3.5 h-3.5" />
          STRATEGIC ROADMAP
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <StrategyKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <StrategicPlanList />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <ForecastPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <ObjectivesList />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <InitiativesList />
        </div>
      </div>
    </div>
  );
};
