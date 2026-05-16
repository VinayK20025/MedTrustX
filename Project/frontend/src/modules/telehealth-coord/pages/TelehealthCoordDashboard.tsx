'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { SessionSchedulePanel } from '../components/SessionSchedulePanel';
import { SessionWorkspace } from '../components/SessionWorkspace';
import { useTelehealthCoordDashboard } from '../hooks/useTelehealthCoordAnalytics';
import type { TelehealthKPI } from '../types/telehealth-coord.types';
import { Monitor, AlertTriangle } from 'lucide-react';

function ThcKPICard({ kpi }: { kpi: TelehealthKPI }) {
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

export function TelehealthCoordDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useTelehealthCoordDashboard({});
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Telehealth Coordinator', 'Virtual care session scheduling, doctor availability, and operational issue resolution');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.sessions && !selectedSessionId) {
      const live = data.data.sessions.find(s => s.status === 'In Progress');
      const waiting = data.data.sessions.find(s => s.status === 'Patient Waiting');
      setSelectedSessionId(live?.id || waiting?.id || data.data.sessions[0]?.id);
    }
  }, [data, selectedSessionId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const openIssues = d.issues.filter(i => i.status === 'Open').length;
  const patientsWaiting = d.sessions.filter(s => s.status === 'Patient Waiting').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {(patientsWaiting > 0 || openIssues > 0) && (
        <div className="flex gap-3 flex-wrap">
          {patientsWaiting > 0 && (
            <div className="bg-warning/20 border border-warning/40 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
              <AlertTriangle className="w-4 h-4 text-warning-light shrink-0" />
              <div>
                <span className="text-[11px] font-black text-warning-light uppercase tracking-widest">{patientsWaiting} Patient(s) Waiting</span>
                <p className="text-[10px] text-orange-200 mt-0.5">Doctor(s) have not joined. Send notification alerts.</p>
              </div>
            </div>
          )}
          {openIssues > 0 && (
            <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
              <AlertTriangle className="w-4 h-4 text-emergency-light shrink-0" />
              <div>
                <span className="text-[11px] font-black text-emergency-light uppercase tracking-widest">{openIssues} Open Issue(s)</span>
                <p className="text-[10px] text-red-200 mt-0.5">Session issues require intervention.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Remote Care' }, { label: 'Telehealth Coordinator' }]} />
        <div className="text-[12px] font-bold text-cyan-400 flex items-center gap-2 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/25">
          <Monitor className="w-4 h-4" /> Operations Control Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <ThcKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <SessionSchedulePanel sessions={d.sessions} selectedId={selectedSessionId} onSelect={setSelectedSessionId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <SessionWorkspace doctors={d.doctors} issues={d.issues} />
        </div>
      </div>
    </div>
  );
}
