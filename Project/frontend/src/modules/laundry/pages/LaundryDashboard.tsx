'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { LinenTasksPanel } from '../components/LinenTasksPanel';
import { LinenProcessingWorkspace } from '../components/LinenProcessingWorkspace';
import { useLaundryDashboard } from '../hooks/useLaundryAnalytics';
import type { LaundryKPI } from '../types/laundry.types';
import { WashingMachine, AlertTriangle } from 'lucide-react';

function LndKPICard({ kpi }: { kpi: LaundryKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
      </div>
    </div>
  );
}

export function LaundryDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useLaundryDashboard({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Laundry Staff', 'Linen logistics, infectious segregation, and bulk processing plant operations');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.tasks && !selectedTaskId) {
      const active = data.data.tasks.find(t => t.status === 'In Progress' || t.category === 'Infectious');
      setSelectedTaskId(active ? active.id : data.data.tasks[0]?.id);
    }
  }, [data, selectedTaskId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedTask = d.tasks.find(t => t.id === selectedTaskId);
  const infectiousCount = d.tasks.filter(t => t.category === 'Infectious' && t.status !== 'Completed').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {infectiousCount > 0 && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">INFECTIOUS LINEN PROTOCOL</span>
            <p className="text-[11px] text-red-300 mt-0.5">{infectiousCount} pending collection(s) require biohazard segregation. Use red isolation bags.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Facility Management' }, { label: 'Laundry & Linen Services' }]} />
        <div className="text-[12px] font-bold text-purple-400 flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/25">
          <WashingMachine className="w-4 h-4" /> Plant Monitoring Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <LndKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <LinenTasksPanel tasks={d.tasks} selectedId={selectedTaskId} onSelect={setSelectedTaskId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <LinenProcessingWorkspace task={selectedTask} batches={d.activeBatches} />
        </div>
      </div>
    </div>
  );
}
