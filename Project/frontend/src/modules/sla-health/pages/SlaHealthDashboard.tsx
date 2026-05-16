'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { SlaDefinitionsPanel } from '../components/SlaDefinitionsPanel';
import { ServiceHealthPanel } from '../components/ServiceHealthPanel';
import { SlaViolationsPanel } from '../components/SlaViolationsPanel';
import { HealthEventsPanel } from '../components/HealthEventsPanel';
import { useSlaHealth } from '../hooks/useSlaHealth';
import { Activity, ShieldCheck, AlertTriangle, Clock, Server, BarChart2 } from 'lucide-react';

interface SlaKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function SlaKPICard({ kpi }: { kpi: SlaKPI }) {
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
        <div className="p-2 rounded-lg bg-teal-500/15"><Icon className="w-4 h-4 text-teal-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const SlaHealthDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useHealth } = useSlaHealth();
  const healthQuery = useHealth();

  useEffect(() => {
    setPageMeta('SLA & Health Metrics', 'Service Level Agreement monitoring and service uptime tracking');
  }, [setPageMeta]);

  if (healthQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: SlaKPI[] = [
    { id: 'uptime', title: 'Platform Uptime', value: '99.99%', status: 'success', icon: Activity, subtitle: 'Trailing 30 days' },
    { id: 'slas', title: 'SLA Contracts', value: 48, status: 'normal', icon: ShieldCheck, subtitle: 'Active definitions' },
    { id: 'violations', title: 'SLA Breaches', value: 2, status: 'warning', icon: AlertTriangle, subtitle: 'Current month' },
    { id: 'error-budget', title: 'Error Budget', value: '82%', status: 'success', icon: BarChart2, subtitle: 'Remaining margin' },
    { id: 'services', title: 'Services Monitored', value: 139, status: 'normal', icon: Server, subtitle: 'Core microservices' },
    { id: 'mttr', title: 'Downtime (30d)', value: '4m 12s', status: 'success', icon: Clock, subtitle: 'Cumulative impact' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Reliability' }, { label: 'SLA & Health' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-teal-300 bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/25">
          <Activity className="w-3.5 h-3.5" />
          SERVICE LEVEL AGREEMENTS
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <SlaKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <ServiceHealthPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <SlaViolationsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <SlaDefinitionsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <HealthEventsPanel />
        </div>
      </div>
    </div>
  );
};
