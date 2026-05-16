'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PanelsPanel } from '../components/PanelsPanel';
import { DataSourcesPanel } from '../components/DataSourcesPanel';
import { AlertVisualizationsPanel } from '../components/AlertVisualizationsPanel';
import { DashboardsPanel } from '../components/DashboardsPanel';
import { useGrafana } from '../hooks/useGrafana';
import { BarChart3, Layout, Database, AlertTriangle, Users, Activity } from 'lucide-react';

interface GrafanaKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function GrafanaKPICard({ kpi }: { kpi: GrafanaKPI }) {
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
        <div className="p-2 rounded-lg bg-orange-500/15"><Icon className="w-4 h-4 text-orange-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const GrafanaDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useDashboards } = useGrafana();
  const dashQuery = useDashboards();

  useEffect(() => {
    setPageMeta('Grafana', 'Observability visualization — dashboards, alerts, and data source management');
  }, [setPageMeta]);

  if (dashQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: GrafanaKPI[] = [
    { id: 'dashboards', title: 'Active Dashboards', value: 67, status: 'success', icon: Layout, subtitle: 'Clinical + Infra panels' },
    { id: 'datasources', title: 'Data Sources', value: 12, status: 'normal', icon: Database, subtitle: 'Prometheus, Loki, etc.' },
    { id: 'alerts', title: 'Firing Alerts', value: 5, status: 'warning', icon: AlertTriangle, subtitle: '2 critical, 3 warning' },
    { id: 'users', title: 'Active Users', value: 234, status: 'success', icon: Users, subtitle: 'Viewing dashboards now' },
    { id: 'panels', title: 'Total Panels', value: 892, status: 'normal', icon: BarChart3, subtitle: 'Across all dashboards' },
    { id: 'refresh', title: 'Avg Refresh Rate', value: '10s', status: 'success', icon: Activity, subtitle: 'Auto-refresh interval' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Grafana' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-orange-300 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
          <BarChart3 className="w-3.5 h-3.5" />
          VISUALIZATION PLATFORM
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <GrafanaKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <PanelsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <DataSourcesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <AlertVisualizationsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <DashboardsPanel />
        </div>
      </div>
    </div>
  );
};
