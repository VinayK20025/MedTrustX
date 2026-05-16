'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PatientQueuePanel } from '../components/PatientQueuePanel';
import { ConsultationWorkspace } from '../components/ConsultationWorkspace';
import { NotesPanel } from '../components/NotesPanel';
import { useTelemedicineDashboard } from '../hooks/useTelemedicineAnalytics';
import type { TelmedKPI } from '../types/telemedicine.types';
import { Video, AlertTriangle, Wifi, CheckCircle2 } from 'lucide-react';

function TelmedKPICard({ kpi }: { kpi: TelmedKPI }) {
  const sc: Record<string, string> = { 
    success: 'border-success/20 bg-success/[0.02]', 
    normal: 'border-white/[0.06]', 
    warning: 'border-warning/20 bg-warning/[0.02]', 
    critical: 'border-emergency/20 bg-emergency/[0.04]' 
  };
  const vc: Record<string, string> = { 
    success: 'text-success-light', 
    normal: 'text-white', 
    warning: 'text-warning-light', 
    critical: 'text-emergency-light' 
  };

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
      </div>
    </div>
  );
}

export function TelemedicineDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useTelemedicineDashboard({});
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Telemedicine Doctor', 'Remote clinical consultations, virtual diagnosis, e-prescriptions, and digital health management');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.queue && !selectedPatientId) {
      const active = data.data.queue.find(p => p.status === 'In Consult');
      setSelectedPatientId(active ? active.id : data.data.queue[0]?.id);
    }
  }, [data, selectedPatientId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedPatient = d.queue.find(p => p.id === selectedPatientId);
  const waitingCount = d.queue.filter(p => p.status === 'Waiting').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS / CONNECTIVITY STATUS */}
      <div className="flex gap-3">
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-sky-400" />
          <span className="text-[11px] font-bold text-sky-400">Network Stable: 45ms Latency</span>
        </div>
        {waitingCount > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-light" />
            <span className="text-[11px] font-bold text-warning-light">{waitingCount} patients waiting in queue</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Remote Care' }, { label: 'Telemedicine Consultation' }]} />
        <div className="text-[12px] font-bold text-sky-400 flex items-center gap-2 bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/25">
          <Video className="w-4 h-4" /> Virtual Clinic Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <TelmedKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-3 h-full">
          <PatientQueuePanel queue={d.queue} selectedId={selectedPatientId} onSelect={setSelectedPatientId} />
        </div>
        <div className="xl:col-span-6 h-full">
          <ConsultationWorkspace patient={selectedPatient} templates={d.templates} />
        </div>
        <div className="xl:col-span-3 h-full">
          <NotesPanel />
        </div>
      </div>
    </div>
  );
}
