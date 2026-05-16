'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { QueuePanel } from '../components/QueuePanel';
import { ConsultationPanel } from '../components/ConsultationPanel';
import { QuickPrescriptionPanel } from '../components/QuickPrescriptionPanel';
import { ReferralPanel } from '../components/ReferralPanel';
import { useGPDashboard } from '../hooks/useGPAnalytics';
import type { GPFilters } from '../services/gp.api';
import { Bell } from 'lucide-react';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-white/[0.04] bg-white/[0.02]', success: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-white', success: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function GPDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<GPFilters>({ status: 'all' });
  const { data, isLoading } = useGPDashboard(filters);

  useEffect(() => { setPageMeta('OPD Workspace', 'High-speed clinical triage and consultation'); }, [setPageMeta]);

  if (isLoading) {
    return (<div className="space-y-6 animate-fade-in max-w-[1600px]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>);
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'General Physician' }, { label: 'OPD Queue' }]} />
        <div className="flex items-center gap-3">
          {d.alerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emergency/10 border border-emergency/20 text-emergency-light text-xs font-bold animate-pulse">
              <Bell className="w-3.5 h-3.5" /> {d.alerts.length} Alerts
            </div>
          )}
          <Select
            options={[{ label: 'All Queue', value: 'all' }, { label: 'Waiting Only', value: 'waiting' }]}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="w-36 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[600px]">
        {/* Left: Queue */}
        <div className="lg:col-span-4 h-[500px] lg:h-full">
          <QueuePanel queue={d.queue} />
        </div>
        
        {/* Middle/Right: Active Consultation */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full">
          <div className="flex-1">
            <ConsultationPanel consultation={d.currentConsultation} />
          </div>
          <div className="grid grid-cols-2 gap-4 h-[250px]">
            <QuickPrescriptionPanel presets={d.presets} />
            <ReferralPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
