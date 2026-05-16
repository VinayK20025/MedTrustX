'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { RiskScoresPanel } from '../components/RiskScoresPanel';
import { RiskFactorsPanel } from '../components/RiskFactorsPanel';
import { TrendAnalysisPanel } from '../components/TrendAnalysisPanel';
import { PredictiveModelsPanel } from '../components/PredictiveModelsPanel';
import { useLegalRiskAnalytics } from '../hooks/useLegalRiskAnalytics';
import { Activity, ShieldAlert, Target, TrendingUp, AlertOctagon, Brain } from 'lucide-react';

interface RiskKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function RiskKPICard({ kpi }: { kpi: RiskKPI }) {
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
        <div className="p-2 rounded-lg bg-red-500/15"><Icon className="w-4 h-4 text-red-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const LegalRiskDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useScores } = useLegalRiskAnalytics();
  const scoresQuery = useScores();

  useEffect(() => {
    setPageMeta('Legal Risk Analytics', 'AI-driven liability forecasting, mal-practice risk scoring, and trend analysis');
  }, [setPageMeta]);

  if (scoresQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: RiskKPI[] = [
    { id: 'score', title: 'Overall Risk Index', value: '42/100', status: 'success', icon: Activity, subtitle: 'Low risk posture' },
    { id: 'exposure', title: 'Est. Liability Exposure', value: '$2.4M', status: 'warning', icon: ShieldAlert, subtitle: 'Active claims' },
    { id: 'factors', title: 'Key Risk Factors', value: 8, status: 'normal', icon: Target, subtitle: 'Driving index score' },
    { id: 'trend', title: 'Risk Trend (30d)', value: '-12%', status: 'success', icon: TrendingUp, subtitle: 'Improving posture' },
    { id: 'critical', title: 'Critical Hotspots', value: 1, status: 'critical', icon: AlertOctagon, subtitle: 'Departmental focus' },
    { id: 'models', title: 'Predictive Models', value: 5, status: 'normal', icon: Brain, subtitle: 'Running inferences' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Risk Analytics' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/25">
          <Activity className="w-3.5 h-3.5" />
          LIABILITY FORECASTING
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <RiskKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <RiskScoresPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <RiskFactorsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <TrendAnalysisPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <PredictiveModelsPanel />
        </div>
      </div>
    </div>
  );
};
