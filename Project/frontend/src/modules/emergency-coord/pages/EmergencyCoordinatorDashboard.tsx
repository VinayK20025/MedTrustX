'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TriageQueuePanel } from '../components/TriageQueuePanel';
import { CoordinatorWorkspace } from '../components/CoordinatorWorkspace';
import { useEcDashboard } from '../hooks/useEcAnalytics';
import type { CoordinatorKPI } from '../types/emergency-coord.types';
import { AlertTriangle, Activity, Zap } from 'lucide-react';

function EcKPICard({ kpi }: { kpi: CoordinatorKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 shadow-glass-sm flex flex-col justify-between bg-black/30', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3 animate-pulse" />}{kpi.label}
      </p>
      <p className={cn('text-3xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value}</p>
      {kpi.subLabel && <p className="text-[10px] text-gray-500 mt-1">{kpi.subLabel}</p>}
    </div>
  );
}

// Flow pipeline visualization
function FlowPipeline({ counts }: { counts: Record<string, number> }) {
  const stages = [
    { key: 'Incoming', label: 'Incoming', color: 'bg-blue-500' },
    { key: 'Triaging', label: 'Triaging', color: 'bg-yellow-500' },
    { key: 'Routing', label: 'Routing', color: 'bg-orange-500' },
    { key: 'Allocated', label: 'Allocated', color: 'bg-emerald-500' },
    { key: 'Treated', label: 'Treated', color: 'bg-gray-500' },
  ];
  return (
    <div className="bg-black/30 border border-white/[0.06] rounded-xl px-5 py-3 flex items-center gap-2 overflow-x-auto">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest shrink-0 mr-2">Patient Flow</span>
      {stages.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center shrink-0">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border border-white/10', s.color + '/20')}>
              <span className={cn('text-[16px] font-black', counts[s.key] ? 'text-white' : 'text-gray-600')}>{counts[s.key] || 0}</span>
            </div>
            <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider whitespace-nowrap">{s.label}</span>
          </div>
          {i < stages.length - 1 && <div className="w-6 h-0.5 bg-white/10 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function EmergencyCoordinatorDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useEcDashboard({});
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Emergency Coordinator', 'Real-time patient flow, triage routing, and multi-team synchronization');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedPatient = d.patients.find(p => p.id === selectedId);
  const hasRedPatient = d.patients.some(p => p.priority === 'Red' && p.status !== 'Treated');

  // Flow pipeline counts
  const flowCounts = d.patients.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 animate-fade-in max-w-[1800px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Emergency' }, { label: 'Coordinator Console' }]} />
        <div className="flex items-center gap-3">
          {hasRedPatient && (
            <span className="text-[10px] bg-emergency/20 text-emergency-light px-3 py-1.5 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> RED PRIORITY ACTIVE
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-300 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
            <Zap className="w-3.5 h-3.5" /> LIVE — 2s REFRESH
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <EcKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Flow pipeline */}
      <FlowPipeline counts={flowCounts} />

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 h-[650px]">
          <TriageQueuePanel patients={d.patients} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-8 h-[650px]">
          <CoordinatorWorkspace patient={selectedPatient} ambulances={d.ambulances} tasks={d.tasks} resources={d.resources} />
        </div>
      </div>
    </div>
  );
}
