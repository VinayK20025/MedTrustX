'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AlertsPanel } from '../components/AlertsPanel';
import { CorrelatedIncidentsPanel } from '../components/CorrelatedIncidentsPanel';
import { AlertMappingsPanel } from '../components/AlertMappingsPanel';
import { SuppressionRulesPanel } from '../components/SuppressionRulesPanel';
import { useAlertCorrelation } from '../hooks/useAlertCorrelation';
import { Siren, GitMerge, Filter, AlertTriangle, Activity, Shield } from 'lucide-react';

interface CorrelationKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function CorrelationKPICard({ kpi }: { kpi: CorrelationKPI }) {
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

export const AlertCorrelationDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useAlerts, useIncidents } = useAlertCorrelation();
  const alertsQuery = useAlerts();
  const incidentsQuery = useIncidents();

  useEffect(() => {
    setPageMeta('Alert Correlation', 'Intelligent alert deduplication, grouping, and root-cause correlation engine');
  }, [setPageMeta]);

  if (alertsQuery.isLoading && incidentsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: CorrelationKPI[] = [
    { id: 'raw', title: 'Raw Alerts (24h)', value: 2847, status: 'normal', icon: Siren, subtitle: 'From all sources' },
    { id: 'correlated', title: 'Correlated Incidents', value: 12, status: 'warning', icon: GitMerge, subtitle: 'Grouped from 2847 alerts' },
    { id: 'suppressed', title: 'Suppressed', value: 1890, status: 'success', icon: Filter, subtitle: '66% noise reduction' },
    { id: 'critical', title: 'Critical Open', value: 3, status: 'critical', icon: AlertTriangle, subtitle: 'Require immediate action' },
    { id: 'mttr', title: 'MTTR', value: '12 min', status: 'success', icon: Activity, subtitle: 'Mean time to resolve' },
    { id: 'accuracy', title: 'Correlation Accuracy', value: '94.7%', status: 'success', icon: Shield, subtitle: 'True positive rate' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Alert Correlation Engine' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-rose-300 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/25">
          <GitMerge className="w-3.5 h-3.5" />
          ALERT CORRELATION ENGINE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <CorrelationKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <CorrelatedIncidentsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <AlertsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <AlertMappingsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <SuppressionRulesPanel />
        </div>
      </div>
    </div>
  );
};
