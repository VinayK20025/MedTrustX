'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { IcnTaskListPanel } from '../components/IcnTaskListPanel';
import { IcnAuditWorkspace } from '../components/IcnAuditWorkspace';
import { useIcnDashboard } from '../hooks/useIcnAnalytics';
import type { IcnKPI } from '../types/icn.types';
import { ShieldCheck } from 'lucide-react';

function IcnKPICard({ kpi }: { kpi: IcnKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-3 flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <p className={cn('text-2xl font-black mt-1 font-mono', vc[kpi.status])}>{kpi.value}</p>
    </div>
  );
}

export function IcnDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useIcnDashboard({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Infection Control Nurse', 'Field audits, hygiene compliance, and patient surveillance');
  }, [setPageMeta]);

  // Auto-select first task if none selected
  useEffect(() => {
    if (data?.data?.tasks && !selectedTaskId) {
      const active = data.data.tasks.find(t => t.status === 'In Progress');
      if (active) setSelectedTaskId(active.id);
    }
  }, [data, selectedTaskId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1200px] mx-auto">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedTask = d.tasks.find(t => t.id === selectedTaskId);
  // Match audit to task if applicable
  const auditData = d.activeAudit?.taskId === selectedTaskId ? d.activeAudit : undefined;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Ward Staff' }, { label: 'Infection Control Nurse' }]} />
        <div className="text-[12px] font-bold text-teal-400 flex items-center gap-2 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/25">
          <ShieldCheck className="w-4 h-4" /> {d.nurseName} • On Duty
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {d.kpis.map(k => <IcnKPICard key={k.id} kpi={k} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[calc(100vh-280px)] min-h-[600px]">
        <div className="md:col-span-5 lg:col-span-4 h-full">
          <IcnTaskListPanel tasks={d.tasks} selectedTaskId={selectedTaskId} onSelect={setSelectedTaskId} />
        </div>
        <div className="md:col-span-7 lg:col-span-8 h-full">
          <IcnAuditWorkspace task={selectedTask} audit={auditData} />
        </div>
      </div>
    </div>
  );
}
