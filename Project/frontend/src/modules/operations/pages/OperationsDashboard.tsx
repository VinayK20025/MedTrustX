'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PatientFlowPanel } from '../components/PatientFlowPanel';
import { BedManagementPanel } from '../components/BedManagementPanel';
import { OpsIncidentPanel } from '../components/OpsIncidentPanel';
import { useOperationsDashboard } from '../hooks/useOperationsAnalytics';
import type { OpsFilters } from '../services/operations.api';
import type { OpsKPI } from '../types/operations.types';
import { ActivitySquare, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function OpsKPICard({ kpi }: { kpi: OpsKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  const trendIcon = {
    up: <TrendingUp className="w-3.5 h-3.5" />,
    down: <TrendingDown className="w-3.5 h-3.5" />,
    flat: <Minus className="w-3.5 h-3.5" />,
  };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <div className="flex justify-between items-end mt-2">
        <p className={cn('text-2xl font-black font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
        {kpi.trend && <span className={cn("mb-1 opacity-70", kpi.trend === 'up' && kpi.status === 'critical' ? 'text-emergency-light animate-pulse' : 'text-gray-400')}>{trendIcon[kpi.trend]}</span>}
      </div>
    </div>
  );
}

export function OperationsDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<OpsFilters>({});
  const { data, isLoading } = useOperationsDashboard(filters);

  useEffect(() => { setPageMeta('Operations Manager', 'Real-time hospital command center — patient flow, incidents, and bed management'); }, [setPageMeta]);

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
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Command Center' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <ActivitySquare className="w-3.5 h-3.5" /> LIVE OPS COMMAND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <OpsKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 h-[650px]">
          <PatientFlowPanel flow={d.flow} />
        </div>
        <div className="xl:col-span-5 h-[650px]">
          <BedManagementPanel beds={d.beds} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          <OpsIncidentPanel incidents={d.incidents} />
        </div>
      </div>
    </div>
  );
}
