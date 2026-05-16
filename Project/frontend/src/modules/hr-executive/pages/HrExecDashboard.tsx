'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { HrExecTaskPanel } from '../components/HrExecTaskPanel';
import { HrExecLeavePanel } from '../components/HrExecLeavePanel';
import { HrExecDocumentPanel } from '../components/HrExecDocumentPanel';
import { useHrExecDashboard } from '../hooks/useHrExecAnalytics';
import type { HrExecFilters } from '../services/hrExec.api';
import type { HrExecKPI } from '../types/hrExec.types';
import { ClipboardList, AlertTriangle, Clock, CalendarOff, FileUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ExKPICard({ kpi }: { kpi: HrExecKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'warning' && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function HrExecDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<HrExecFilters>({});
  const { data, isLoading } = useHrExecDashboard(filters);
  const router = useRouter();

  useEffect(() => { setPageMeta('HR Executive', 'Daily HR task execution — attendance, leaves, documents, and records'); }, [setPageMeta]);

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
        <Breadcrumbs items={[{ label: 'HR Operations' }, { label: 'Executive Workstation' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-teal-300 bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/25">
          <ClipboardList className="w-3.5 h-3.5" /> HR EXEC TERMINAL
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => router.push('/dashboard/hr-executive/attendance')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-[12px]" leftIcon={<Clock className="w-4 h-4" />}>Mark Attendance</Button>
        <Button onClick={() => router.push('/dashboard/hr-executive/leaves')} className="bg-teal-600 hover:bg-teal-500 text-white font-bold h-10 px-5 text-[12px]" leftIcon={<CalendarOff className="w-4 h-4" />}>Approve Leave</Button>
        <Button onClick={() => router.push('/dashboard/hr-executive/documents')} className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-10 px-5 text-[12px]" leftIcon={<FileUp className="w-4 h-4" />}>Upload Document</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <ExKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[600px]">
          <HrExecTaskPanel tasks={d.tasks} />
        </div>
        <div className="xl:col-span-4 h-[600px]">
          <HrExecLeavePanel leaves={d.leaveRequests} />
        </div>
        <div className="xl:col-span-3 h-[600px]">
          <HrExecDocumentPanel documents={d.documents} />
        </div>
      </div>
    </div>
  );
}
