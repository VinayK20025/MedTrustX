'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PatientListPanel } from '../components/PatientListPanel';
import { CareWorkspace } from '../components/CareWorkspace';
import { NurseAlertsPanel } from '../components/NurseAlertsPanel';
import { useNurseWardDashboard } from '../hooks/useNurseWardAnalytics';
import type { NurseKPI } from '../types/nurse-ward.types';
import { Activity, AlertTriangle } from 'lucide-react';

function NwKPICard({ kpi }: { kpi: NurseKPI }) {
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

export function NurseWardDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useNurseWardDashboard({});
  const [selectedPatId, setSelectedPatId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Staff Nurse (Ward)', 'Bedside clinical execution, medication administration, and vitals tracking');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.patients && !selectedPatId) {
      const critical = data.data.patients.find(p => p.status === 'Critical');
      setSelectedPatId(critical ? critical.id : data.data.patients[0]?.id);
    }
  }, [data, selectedPatId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const criticalAlerts = d.alerts.filter(a => a.type === 'Vitals Critical');
  const selectedPat = d.patients.find(p => p.id === selectedPatId);

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {criticalAlerts.length > 0 && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">CRITICAL PATIENT DETERIORATION</span>
            <p className="text-[11px] text-red-300 mt-0.5">{criticalAlerts.length} assigned patient(s) have abnormal vitals requiring immediate bedside intervention.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Clinical Operations' }, { label: 'Ward Execution' }]} />
        <div className="text-[12px] font-bold text-blue-400 flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <Activity className="w-4 h-4" /> Live Bedside Monitoring Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <NwKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-3 h-full">
          <PatientListPanel patients={d.patients} alerts={d.alerts} selectedId={selectedPatId} onSelect={setSelectedPatId} />
        </div>
        <div className="xl:col-span-6 h-full">
          <CareWorkspace patient={selectedPat} meds={d.medications} tasks={d.tasks} vitals={d.vitals} />
        </div>
        <div className="xl:col-span-3 h-full">
          <NurseAlertsPanel alerts={d.alerts} />
        </div>
      </div>
    </div>
  );
}
