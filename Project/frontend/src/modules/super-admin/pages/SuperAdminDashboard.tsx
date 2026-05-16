'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { SuperAdminTenantPanel } from '../components/SuperAdminTenantPanel';
import { SuperAdminPolicyPanel } from '../components/SuperAdminPolicyPanel';
import { SuperAdminUserPanel } from '../components/SuperAdminUserPanel';
import { SuperAdminOverridePanel } from '../components/SuperAdminOverridePanel';
import { SuperAdminMonitoringPanel } from '../components/SuperAdminMonitoringPanel';
import { SuperAdminAuditPanel } from '../components/SuperAdminAuditPanel';
import { SuperAdminAlertPanel } from '../components/SuperAdminAlertPanel';
import { SuperAdminProductivityWidget } from '../components/SuperAdminProductivityWidget';
import { useSuperAdminDashboard } from '../hooks/useSuperAdminAnalytics';
import type { SuperAdminFilters } from '../services/superAdmin.api';
import type { SuperAdminKPI } from '../types/superAdmin.types';
import { Crown, TrendingUp, TrendingDown, Minus, ArrowRight, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ── KPI Card ──────────────────────────────────────────── */
function GlobalKPICard({ kpi }: { kpi: SuperAdminKPI }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover',
      statusColors[kpi.status]
    )} onClick={() => kpi.actionUrl && router.push(kpi.actionUrl)}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        {kpi.trendDirection && (
          <div className={cn('flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded',
            kpi.trendDirection === 'up' ? 'text-success-light bg-success/10' :
            kpi.trendDirection === 'down' ? 'text-emergency-light bg-emergency/10' :
            'text-gray-500 bg-white/5'
          )}>
            {kpi.trendDirection === 'up' && <TrendingUp className="w-2.5 h-2.5" />}
            {kpi.trendDirection === 'down' && <TrendingDown className="w-2.5 h-2.5" />}
            {kpi.trendDirection === 'neutral' && <Minus className="w-2.5 h-2.5" />}
            {kpi.trend !== undefined && `${Math.abs(kpi.trend)}%`}
          </div>
        )}
      </div>
      <p className={cn('text-2xl font-black mt-2', valueColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────── */
export function SuperAdminDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<SuperAdminFilters>({ timeframe: 'today' });
  const { data, isLoading } = useSuperAdminDashboard(filters);

  useEffect(() => {
    setPageMeta('Super Administrator', 'Global multi-tenant governance and control — Zero Trust enforced');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1800px]">
        <div className="flex justify-between"><Skeleton className="h-6 w-48" /><Skeleton className="h-10 w-32" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Global Command Center' }]} />
        <div className="flex items-center gap-3">
          <Select
            options={[
              { label: 'Today (Live)', value: 'today' },
              { label: 'Trailing 7 Days', value: '7d' },
              { label: 'Trailing 30 Days', value: '30d' },
              { label: 'Trailing 90 Days', value: '90d' },
            ]}
            value={filters.timeframe || 'today'}
            onChange={(e) => setFilters({ ...filters, timeframe: e.target.value as any })}
            className="w-full sm:w-44 bg-surface-dark border-white/[0.08]"
          />
          <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25 whitespace-nowrap">
            <Crown className="w-3.5 h-3.5" />
            SUPER ADMIN
            <span className="text-gray-600 mx-0.5">·</span>
            <Shield className="w-3 h-3 text-teal-400" />
            <span className="text-teal-400">ZTA</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <GlobalKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Row 1: Tenants + Alerts + Productivity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5">
          <SuperAdminTenantPanel tenants={d.tenants} />
        </div>
        <div className="xl:col-span-4">
          <SuperAdminAlertPanel alerts={d.alerts} />
        </div>
        <div className="xl:col-span-3">
          <SuperAdminProductivityWidget metrics={d.productivity} />
        </div>
      </div>

      {/* Row 2: Policies + Overrides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SuperAdminPolicyPanel policies={d.policies} />
        <SuperAdminOverridePanel overrides={d.overrides} />
      </div>

      {/* Row 3: Users + Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SuperAdminUserPanel users={d.users} />
        <SuperAdminMonitoringPanel services={d.monitoring.services} infra={d.monitoring.infra} timeSeries={d.monitoring.timeSeries} />
      </div>

      {/* Row 4: Audit Trail (Full Width) */}
      <SuperAdminAuditPanel auditLogs={d.auditLogs} />
    </div>
  );
}
