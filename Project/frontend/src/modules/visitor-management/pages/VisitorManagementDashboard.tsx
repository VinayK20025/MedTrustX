'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { VisitorsPanel } from '../components/VisitorsPanel';
import { VisitsPanel } from '../components/VisitsPanel';
import { BadgesPanel } from '../components/BadgesPanel';
import { VisitLogsPanel } from '../components/VisitLogsPanel';
import { useVisitorManagement } from '../hooks/useVisitorManagement';
import { Users, UserCheck, AlertTriangle, CreditCard, Building, History } from 'lucide-react';

interface VisitorKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function VisitorKPICard({ kpi }: { kpi: VisitorKPI }) {
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

export const VisitorManagementDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useVisitors } = useVisitorManagement();
  const visitorsQuery = useVisitors();

  useEffect(() => {
    setPageMeta('Visitor Management', 'Hospital guest tracking, access provisioning, and watchlist monitoring');
  }, [setPageMeta]);

  if (visitorsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: VisitorKPI[] = [
    { id: 'active', title: 'Active Visitors', value: 142, status: 'success', icon: Users, subtitle: 'Currently on-site' },
    { id: 'expected', title: 'Expected Today', value: 350, status: 'normal', icon: Building, subtitle: 'Pre-registered' },
    { id: 'badges', title: 'Issued Badges', value: 124, status: 'normal', icon: CreditCard, subtitle: 'Temporary access' },
    { id: 'watch', title: 'Watchlist Hits', value: 0, status: 'success', icon: AlertTriangle, subtitle: 'Security screening' },
    { id: 'logs', title: 'Total Visits', value: '4.2K', status: 'normal', icon: History, subtitle: 'Last 30 days' },
    { id: 'approved', title: 'Clearance Rate', value: '99.2%', status: 'success', icon: UserCheck, subtitle: 'Auto-approved' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Visitor Management' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <Users className="w-3.5 h-3.5" />
          GUEST TRACKING
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <VisitorKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <VisitorsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <BadgesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <VisitsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <VisitLogsPanel />
        </div>
      </div>
    </div>
  );
};
