'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { DataInsightsPanel } from '../components/DataInsightsPanel';
import { AnalyticsWorkspace } from '../components/AnalyticsWorkspace';
import { useQualityDashboard } from '../hooks/useQualityAnalytics';
import type { QaKPI } from '../types/quality-analyst.types';
import { TrendingUp, TrendingDown, Minus, ShieldAlert } from 'lucide-react';

function QaKPICard({ kpi }: { kpi: QaKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  const trendColor = kpi.trend === 'up' && kpi.status === 'success' ? 'text-success-light' : 
                     kpi.trend === 'up' && kpi.status !== 'success' ? 'text-emergency-light' : 
                     kpi.trend === 'down' && kpi.status === 'success' ? 'text-success-light' :
                     kpi.trend === 'down' && kpi.status !== 'success' ? 'text-warning-light' : 'text-gray-500';

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
        <div className={cn('flex items-center gap-1 text-[11px] font-bold bg-white/5 px-2 py-0.5 rounded', trendColor)}>
          <TrendIcon className="w-3 h-3" /> {kpi.trendValue}
        </div>
      </div>
    </div>
  );
}

export function QualityAnalystDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useQualityDashboard({});

  useEffect(() => {
    setPageMeta('Quality Analyst', 'Data intelligence, metric analysis, anomaly detection, and insights');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const criticalAnomalies = d.insights.filter(i => i.severity === 'Critical');

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ANOMALY BANNER */}
      {criticalAnomalies.length > 0 && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">CRITICAL ANOMALY DETECTED</span>
            <p className="text-[11px] text-red-300 mt-0.5">{criticalAnomalies[0].description}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Quality & Safety' }, { label: 'Data Intelligence' }]} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <QaKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 min-h-[600px]">
        <div className="xl:col-span-8 h-full">
          <AnalyticsWorkspace comparisons={d.comparisons} trends={d.trends} />
        </div>
        <div className="xl:col-span-4 h-full">
          <DataInsightsPanel insights={d.insights} sources={d.sources} />
        </div>
      </div>
    </div>
  );
}
