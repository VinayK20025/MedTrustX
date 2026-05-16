'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { RiskRegistryPanel } from '../components/RiskRegistryPanel';
import { RiskAssessmentsPanel } from '../components/RiskAssessmentsPanel';
import { MitigationPlansPanel } from '../components/MitigationPlansPanel';
import { RiskEventsPanel } from '../components/RiskEventsPanel';
import { useRiskOversight } from '../hooks/useRiskOversight';
import { ShieldAlert, AlertOctagon, Target, Activity, FileCheck, Brain } from 'lucide-react';

interface ERMKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function ERMKPICard({ kpi }: { kpi: ERMKPI }) {
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
        <div className="p-2 rounded-lg bg-rose-500/15"><Icon className="w-4 h-4 text-rose-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const EnterpriseRiskDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useRisks } = useRiskOversight();
  const risksQuery = useRisks();

  useEffect(() => {
    setPageMeta('Enterprise Risk Management', 'Holistic clinical, financial, and operational risk oversight');
  }, [setPageMeta]);

  if (risksQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: ERMKPI[] = [
    { id: 'risks', title: 'Identified Risks', value: 84, status: 'normal', icon: ShieldAlert, subtitle: 'Across all domains' },
    { id: 'critical', title: 'Critical Risks', value: 3, status: 'critical', icon: AlertOctagon, subtitle: 'Requires immediate action' },
    { id: 'assessments', title: 'Risk Assessments', value: 142, status: 'success', icon: Activity, subtitle: 'Completed this quarter' },
    { id: 'mitigations', title: 'Mitigation Plans', value: 76, status: 'normal', icon: Target, subtitle: 'Active control measures' },
    { id: 'audits', title: 'Control Audits', value: 24, status: 'warning', icon: FileCheck, subtitle: 'Pending review' },
    { id: 'predictive', title: 'AI Risk Score', value: '42/100', status: 'success', icon: Brain, subtitle: 'Overall exposure index' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Enterprise Risk (ERM)' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-rose-300 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/25">
          <ShieldAlert className="w-3.5 h-3.5" />
          RISK MANAGEMENT
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <ERMKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <RiskRegistryPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <RiskAssessmentsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <MitigationPlansPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <RiskEventsPanel />
        </div>
      </div>
    </div>
  );
};
