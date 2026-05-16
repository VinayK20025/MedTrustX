'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { LabTechSampleQueue } from '../components/LabTechSampleQueue';
import { LabTechProcessingPanel } from '../components/LabTechProcessingPanel';
import { LabTechExecutionPanel } from '../components/LabTechExecutionPanel';
import { LabTechQCPanel } from '../components/LabTechQCPanel';
import { LabTechAlertPanel } from '../components/LabTechAlertPanel';
import { useLabTechDashboard } from '../hooks/useLabTechAnalytics';
import type { LabTechFilters } from '../services/labTech.api';
import type { LabTechKPI } from '../types/labTech.types';
import { Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function LabTechKPICard({ kpi }: { kpi: LabTechKPI }) {
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
          <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function LabTechDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<LabTechFilters>({});
  const { data, isLoading } = useLabTechDashboard(filters);

  useEffect(() => {
    setPageMeta('Lab Technician', 'High-efficiency sample processing and instrument execution');
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
        <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Tech Operations' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-orange-300 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
          <Zap className="w-3.5 h-3.5" />
          WORKFLOW EXECUTION
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <LabTechKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Row 1: Queue & SOP */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[350px]">
          <LabTechSampleQueue samples={d.samples} />
        </div>
        <div className="xl:col-span-7 h-[350px]">
          <LabTechProcessingPanel activeSample={d.activeSample} steps={d.processingSteps} />
        </div>
      </div>

      {/* Row 2: Devices, QC, Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[350px]">
          <LabTechExecutionPanel devices={d.devices} />
        </div>
        <div className="xl:col-span-3 h-[350px]">
          <LabTechQCPanel qcTasks={d.qcTasks} />
        </div>
        <div className="xl:col-span-3 h-[350px]">
          <LabTechAlertPanel alerts={d.alerts} />
        </div>
      </div>
    </div>
  );
}
