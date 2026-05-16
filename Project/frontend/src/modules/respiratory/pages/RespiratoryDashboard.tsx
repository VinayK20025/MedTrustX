'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { RespiratoryPatientPanel } from '../components/RespiratoryPatientPanel';
import { RespiratoryDevicePanel } from '../components/RespiratoryDevicePanel';
import { RespiratoryMonitoringPanel } from '../components/RespiratoryMonitoringPanel';
import { RespiratoryTherapyPanel } from '../components/RespiratoryTherapyPanel';
import { RespiratoryProcedurePanel } from '../components/RespiratoryProcedurePanel';
import { RespiratoryAlertPanel } from '../components/RespiratoryAlertPanel';
import { useRespiratoryDashboard } from '../hooks/useRespiratoryAnalytics';
import type { RespiratoryFilters } from '../services/respiratory.api';
import type { RespiratoryKPI } from '../types/respiratory.types';
import { Wind, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function RespiratoryKPICard({ kpi }: { kpi: RespiratoryKPI }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover',
      statusColors[kpi.status]
    )} onClick={() => kpi.actionUrl && router.push(kpi.actionUrl)}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      </div>
      <p className={cn('text-2xl font-black mt-2', valueColors[kpi.status])}>{kpi.value}</p>
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function RespiratoryDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<RespiratoryFilters>({ department: 'ICU' });
  const { data, isLoading } = useRespiratoryDashboard(filters);

  useEffect(() => {
    setPageMeta('Respiratory Therapist', 'Live ICU ventilator monitoring, oxygen therapy, and airway management');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'ICU / Pulmonology' }, { label: 'RT Workspace' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <Wind className="w-3.5 h-3.5" />
          LIFE SUPPORT ACTIVE
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <RespiratoryKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Row 1: Live Monitoring & Alerts (Critical Visibility) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <RespiratoryMonitoringPanel vitals={d.liveVitals} />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <RespiratoryAlertPanel alerts={d.alerts} />
        </div>
      </div>

      {/* Row 2: Devices & Patients */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[450px]">
          <RespiratoryDevicePanel devices={d.devices} />
        </div>
        <div className="xl:col-span-6 h-[450px]">
          <RespiratoryPatientPanel patients={d.patients} />
        </div>
      </div>

      {/* Row 3: Procedures & Therapy */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[350px]">
          <RespiratoryProcedurePanel procedures={d.procedures} />
        </div>
        <div className="xl:col-span-6 h-[350px]">
          <RespiratoryTherapyPanel therapies={d.therapies} />
        </div>
      </div>
    </div>
  );
}
