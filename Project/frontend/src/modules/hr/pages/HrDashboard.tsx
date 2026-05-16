'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { HrStaffDirectory } from '../components/HrStaffDirectory';
import { HrShiftPanel } from '../components/HrShiftPanel';
import { HrCredentialPanel } from '../components/HrCredentialPanel';
import { useHrDashboard } from '../hooks/useHrAnalytics';
import type { HrFilters } from '../services/hr.api';
import type { HrKPI } from '../types/hr.types';
import { Briefcase, AlertTriangle } from 'lucide-react';

function HrKPICard({ kpi }: { kpi: HrKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function HrDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<HrFilters>({});
  const { data, isLoading } = useHrDashboard(filters);

  useEffect(() => { setPageMeta('HR Manager', 'Hospital workforce intelligence — staffing, compliance, and scheduling'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Human Resources' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <Briefcase className="w-3.5 h-3.5" /> WORKFORCE COMMAND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <HrKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <HrStaffDirectory staff={d.staffDirectory} />
        </div>
        <div className="xl:col-span-5 h-[650px]">
          <HrShiftPanel shifts={d.shiftOverview} deptStaffing={d.departmentStaffing} />
        </div>
        <div className="xl:col-span-4 h-[650px]">
          <HrCredentialPanel alerts={d.credentialAlerts} />
        </div>
      </div>
    </div>
  );
}
