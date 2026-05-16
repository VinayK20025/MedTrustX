'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { CaseQueuePanel } from '../components/CaseQueuePanel';
import { CaseWorkspace } from '../components/CaseWorkspace';
import { OpinionPanel } from '../components/OpinionPanel';
import { useConsultantDashboard } from '../hooks/useConsultantAnalytics';
import type { ConsultantKPI } from '../types/remote-consultant.types';
import { Stethoscope, AlertTriangle } from 'lucide-react';

function RcKPICard({ kpi }: { kpi: ConsultantKPI }) {
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

export function RemoteConsultantDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useConsultantDashboard({});
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Remote Consultant', 'Specialist case review, expert second opinions, and cross-facility clinical collaboration');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.cases && !selectedCaseId) {
      const urgent = data.data.cases.find(c => c.priority === 'Urgent' && c.status === 'Pending');
      setSelectedCaseId(urgent ? urgent.id : data.data.cases[0]?.id);
    }
  }, [data, selectedCaseId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedCase = d.cases.find(c => c.id === selectedCaseId);
  const urgentPending = d.cases.filter(c => c.priority === 'Urgent' && c.status === 'Pending').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {urgentPending > 0 && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-emergency-light shrink-0 animate-pulse" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">URGENT SECOND OPINION REQUESTED</span>
            <p className="text-[11px] text-red-200 mt-0.5">{urgentPending} case(s) flagged as urgent by the referring physician. Priority review required.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Remote Care' }, { label: 'Specialist Consultant' }]} />
        <div className="text-[12px] font-bold text-amber-400 flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/25">
          <Stethoscope className="w-4 h-4" /> Expert Advisory Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <RcKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-3 h-full">
          <CaseQueuePanel cases={d.cases} selectedId={selectedCaseId} onSelect={setSelectedCaseId} />
        </div>
        <div className="xl:col-span-6 h-full">
          <CaseWorkspace caseData={selectedCase} />
        </div>
        <div className="xl:col-span-3 h-full">
          <OpinionPanel selectedCaseId={selectedCaseId} />
        </div>
      </div>
    </div>
  );
}
