'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { GuardAlertPanel } from '../components/GuardAlertPanel';
import { GuardActionWorkspace } from '../components/GuardActionWorkspace';
import { useGuardDashboard } from '../hooks/useGuardAnalytics';
import type { GuardKPI } from '../types/guard.types';
import { Shield, AlertTriangle, Clock, Wifi } from 'lucide-react';

function GuardKPICard({ kpi }: { kpi: GuardKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3" />}{kpi.label}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value}</p>
    </div>
  );
}

export function GuardDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useGuardDashboard({});
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Security Guard', 'Field execution — patrol, access control, and incident response');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1400px]">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const emergencyTask = d.tasks.find(t => t.isEmergency);
  const selectedTask = d.tasks.find(t => t.id === selectedId);

  // Auto-select emergency task if nothing selected
  const displayTask = selectedTask || emergencyTask;

  // Shift countdown
  const minsLeft = Math.max(0, Math.floor((new Date(d.shiftEnd).getTime() - Date.now()) / 60000));
  const hoursLeft = Math.floor(minsLeft / 60);
  const remMins = minsLeft % 60;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Guard Console' }]} />
        <div className="flex items-center gap-3">
          {emergencyTask && (
            <span className="text-[10px] bg-emergency/20 text-emergency-light px-3 py-1.5 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> EMERGENCY ACTIVE
            </span>
          )}
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Shift ends in {hoursLeft}h {remMins}m
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
            <Wifi className="w-3 h-3" /> ONLINE
          </div>
        </div>
      </div>

      {/* Guard Identity banner */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-white">{d.guardName}</p>
          <p className="text-[11px] text-gray-400">On Active Duty • Field Security</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <GuardKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main layout: Task list + Action workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 h-[620px]">
          <GuardAlertPanel tasks={d.tasks} selectedId={selectedId || displayTask?.id} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-8 h-[620px]">
          <GuardActionWorkspace task={displayTask} patrol={d.todayPatrol} />
        </div>
      </div>
    </div>
  );
}
