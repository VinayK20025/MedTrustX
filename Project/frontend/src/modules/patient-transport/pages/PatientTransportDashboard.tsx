'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TransportTasksPanel } from '../components/TransportTasksPanel';
import { TransportActionWorkspace } from '../components/TransportActionWorkspace';
import { usePatientTransportDashboard } from '../hooks/usePatientTransportAnalytics';
import type { TransportKPI } from '../types/patient-transport.types';
import { Navigation, MapPin } from 'lucide-react';

function TrKPICard({ kpi }: { kpi: TransportKPI }) {
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

export function PatientTransportDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = usePatientTransportDashboard({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Assistant Transport Staff', 'Mobile patient transport, real-time tracking, and department coordination');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.tasks && !selectedTaskId) {
      const active = data.data.tasks.find(t => t.status === 'In Transit' || t.priority === 'Urgent');
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

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Operations & Mobility' }, { label: 'Patient Transport' }]} />
        <div className="text-[12px] font-bold text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <MapPin className="w-4 h-4" /> Live Location Tracking Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <TrKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <TransportTasksPanel tasks={d.tasks} selectedId={selectedTaskId} onSelect={setSelectedTaskId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <TransportActionWorkspace task={selectedTask} />
        </div>
      </div>
    </div>
  );
}
