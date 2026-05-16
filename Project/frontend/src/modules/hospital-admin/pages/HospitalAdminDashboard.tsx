'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AdminBedManagementPanel } from '../components/AdminBedManagementPanel';
import { AdminDepartmentPerformancePanel } from '../components/AdminDepartmentPerformancePanel';
import { AdminAlertsPanel } from '../components/AdminAlertsPanel';
import { useAdminDashboard } from '../hooks/useAdminAnalytics';
import type { AdminFilters } from '../services/admin.api';
import type { AdminKPI } from '../types/admin.types';
import { Building2, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

function AdminKPICard({ kpi }: { kpi: AdminKPI }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40 bg-warning/[0.02]',
    critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };

  const formattedValue = kpi.format === 'currency' 
    ? `$${Number(kpi.value).toLocaleString()}` 
    : kpi.value.toLocaleString();

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-5 transition-all duration-300 shadow-glass-sm flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover',
      statusColors[kpi.status]
    )} onClick={() => kpi.actionUrl && router.push(kpi.actionUrl)}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          {kpi.title}
        </p>
        {kpi.trend !== undefined && (
          <span className={cn("flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded",
            kpi.trendDirection === 'up' ? 'text-success-light bg-success/10' :
            kpi.trendDirection === 'down' ? 'text-emergency-light bg-emergency/10' : 'text-gray-400 bg-white/5'
          )}>
            {kpi.trendDirection === 'up' && <TrendingUp className="w-3 h-3"/>}
            {kpi.trendDirection === 'down' && <TrendingDown className="w-3 h-3"/>}
            {kpi.trendDirection === 'neutral' && <Minus className="w-3 h-3"/>}
            {kpi.trend}%
          </span>
        )}
      </div>
      <p className={cn('text-3xl font-black mt-3 font-mono', valueColors[kpi.status])}>
        {formattedValue}
      </p>
      {kpi.actionLabel && (
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  );
}

export function HospitalAdminDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<AdminFilters>({});
  const { data, isLoading } = useAdminDashboard(filters);

  useEffect(() => {
    setPageMeta('Hospital Administrator', 'Real-time multi-domain hospital operational command center');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1800px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Hospital Command Center' }]} />
        <div className="flex items-center gap-2 text-[12px] font-bold text-blue-300 bg-blue-500/10 px-5 py-2.5 rounded-lg border border-blue-500/25 shadow-glass-sm">
          <Building2 className="w-4 h-4" />
          ADMINISTRATOR TERMINAL
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {d.kpis.map(kpi => <AdminKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Main Orchestration Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Flow & Performance (Wide) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="h-[400px]">
            <AdminBedManagementPanel beds={d.bedOccupancy} />
          </div>
          <div className="h-[350px]">
             <AdminDepartmentPerformancePanel departments={d.departments} />
          </div>
        </div>

        {/* Right Column: Active Crises & Alerts (Narrow) */}
        <div className="xl:col-span-4 h-[774px]">
           <AdminAlertsPanel alerts={d.alerts} />
        </div>
      </div>
    </div>
  );
}
