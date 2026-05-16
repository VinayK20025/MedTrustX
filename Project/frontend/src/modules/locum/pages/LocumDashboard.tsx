'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AssignedPatientsPanel } from '../components/AssignedPatientsPanel';
import { PatientSnapshotPanel } from '../components/PatientSnapshotPanel';
import { HandoverPanel } from '../components/HandoverPanel';
import { useLocumDashboard } from '../hooks/useLocumAnalytics';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-white/[0.04] bg-white/[0.02]', success: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-white', success: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function LocumDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useLocumDashboard({});

  useEffect(() => { setPageMeta('Shift Overview', 'Context-compressed continuity of care'); }, [setPageMeta]);

  if (isLoading) {
    return (<div className="space-y-6 animate-fade-in max-w-[1600px]">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>);
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Locum Doctor' }, { label: 'Shift Overview' }]} />
        <div className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
          SHIFT: 08:00 - 20:00 (Active)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-auto xl:h-[750px]">
        {/* Left: Handover & Tasks */}
        <div className="xl:col-span-3 h-[400px] xl:h-full">
          <HandoverPanel handover={d.handover} />
        </div>
        
        {/* Middle: Assigned Patients List */}
        <div className="xl:col-span-4 h-[400px] xl:h-full">
          <AssignedPatientsPanel patients={d.assignedPatients} />
        </div>

        {/* Right: Patient Snapshot (Deep Dive) */}
        <div className="xl:col-span-5 h-[600px] xl:h-full">
          <PatientSnapshotPanel snapshot={d.activeSnapshot} />
        </div>
      </div>
    </div>
  );
}
