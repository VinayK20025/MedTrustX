'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { DischargePatientList } from '../components/DischargePatientList';
import { DischargeWorkflowChecklist } from '../components/DischargeWorkflowChecklist';
import { DischargeStatusPanel } from '../components/DischargeStatusPanel';
import { useDischargeDashboard } from '../hooks/useDischargeAnalytics';
import type { DischargeFilters } from '../services/discharge.api';
import type { DischargeKPI } from '../types/discharge.types';
import { DoorOpen, AlertTriangle } from 'lucide-react';

function DischKPICard({ kpi }: { kpi: DischargeKPI }) {
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

export function DischargeDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<DischargeFilters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data, isLoading } = useDischargeDashboard(filters);

  useEffect(() => { setPageMeta('Discharge Coordinator', 'Multi-department clearance workflow ensuring safe, compliant patient discharge'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedPatient = d.patients.find(p => p.id === selectedId);

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Patient Flow' }, { label: 'Discharge Coordination' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-orange-300 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
          <DoorOpen className="w-3.5 h-3.5" /> DISCHARGE COMMAND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <DischKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <DischargePatientList patients={d.patients} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-5 h-[650px]">
          <DischargeWorkflowChecklist patient={selectedPatient} />
        </div>
        <div className="xl:col-span-4 h-[650px]">
          <DischargeStatusPanel billing={d.billing} documents={d.documents} />
        </div>
      </div>
    </div>
  );
}
