'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { IncidentsPanel } from '../components/IncidentsPanel';
import { IncidentActionsPanel } from '../components/IncidentActionsPanel';
import { RespondersPanel } from '../components/RespondersPanel';
import { IncidentLogsPanel } from '../components/IncidentLogsPanel';
import { useSecurityIncident } from '../hooks/useSecurityIncident';
import { ShieldAlert, AlertOctagon, Timer, Users, Activity, Crosshair } from 'lucide-react';

interface SecIncidentKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function SecIncidentKPICard({ kpi }: { kpi: SecIncidentKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40', normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40', critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover', statusColors[kpi.status])}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-rose-500/15"><Icon className="w-4 h-4 text-rose-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const SecurityIncidentDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useIncidents } = useSecurityIncident();
  const incidentsQuery = useIncidents();

  useEffect(() => {
    setPageMeta('Security Incidents', 'SOC orchestration, response tracking, and threat mitigation');
  }, [setPageMeta]);

  if (incidentsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: SecIncidentKPI[] = [
    { id: 'open', title: 'Open Incidents', value: 8, status: 'warning', icon: ShieldAlert, subtitle: 'Needs triage' },
    { id: 'critical', title: 'Critical Active', value: 1, status: 'critical', icon: AlertOctagon, subtitle: 'Severity 1 (P1)' },
    { id: 'mtta', title: 'Mean Time to Ack', value: '4m', status: 'success', icon: Timer, subtitle: 'MTTA (7d)' },
    { id: 'mttr', title: 'Mean Time to Res', value: '42m', status: 'success', icon: Crosshair, subtitle: 'MTTR (7d)' },
    { id: 'responders', title: 'On-Call', value: 14, status: 'normal', icon: Users, subtitle: 'SOC analysts online' },
    { id: 'actions', title: 'Automated Actions', value: 84, status: 'success', icon: Activity, subtitle: 'Playbooks executed' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Incident Response' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-rose-300 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/25">
          <ShieldAlert className="w-3.5 h-3.5" />
          SOC ORCHESTRATION
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <SecIncidentKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <IncidentsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <RespondersPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <IncidentActionsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <IncidentLogsPanel />
        </div>
      </div>
    </div>
  );
};
