'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PerformanceMetricsPanel } from '../components/PerformanceMetricsPanel';
import { BenchmarksPanel } from '../components/BenchmarksPanel';
import { PerformanceScoresPanel } from '../components/PerformanceScoresPanel';
import { OptimizationInsightsPanel } from '../components/OptimizationInsightsPanel';
import { usePerformanceIntelligence } from '../hooks/usePerformanceIntelligence';
import { LineChart, TrendingUp, Target, Award, Zap, Activity } from 'lucide-react';

interface PerfKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function PerfKPICard({ kpi }: { kpi: PerfKPI }) {
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

export const PerformanceIntelligenceDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useMetrics } = usePerformanceIntelligence();
  const metricsQuery = useMetrics();

  useEffect(() => {
    setPageMeta('Performance Intelligence', 'Clinical, operational, and financial efficiency analytics');
  }, [setPageMeta]);

  if (metricsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: PerfKPI[] = [
    { id: 'efficiency', title: 'Overall Efficiency', value: '92.4%', status: 'success', icon: Target, subtitle: '+2.1% vs last month' },
    { id: 'metrics', title: 'Tracked Metrics', value: 142, status: 'normal', icon: LineChart, subtitle: 'Across 12 departments' },
    { id: 'benchmarks', title: 'Benchmarks Met', value: '88%', status: 'success', icon: Award, subtitle: 'Industry standards' },
    { id: 'insights', title: 'AI Insights', value: 8, status: 'warning', icon: Zap, subtitle: 'Optimization opportunities' },
    { id: 'trend', title: 'Productivity Trend', value: '+4.2%', status: 'success', icon: TrendingUp, subtitle: 'Staff utilization' },
    { id: 'anomalies', title: 'Variance Alerts', value: 3, status: 'warning', icon: Activity, subtitle: 'Deviations from norm' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Performance Analytics' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <LineChart className="w-3.5 h-3.5" />
          PERFORMANCE INTELLIGENCE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <PerfKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <PerformanceMetricsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <PerformanceScoresPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <BenchmarksPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <OptimizationInsightsPanel />
        </div>
      </div>
    </div>
  );
};
