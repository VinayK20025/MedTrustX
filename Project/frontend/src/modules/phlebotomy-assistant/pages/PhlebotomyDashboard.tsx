'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PhlebotomyPatientQueue } from '../components/PhlebotomyPatientQueue';
import { PhlebotomyPreparationPanel } from '../components/PhlebotomyPreparationPanel';
import { PhlebotomyLabelPanel } from '../components/PhlebotomyLabelPanel';
import { PhlebotomyHandoverPanel } from '../components/PhlebotomyHandoverPanel';
import { PhlebotomyAlertPanel } from '../components/PhlebotomyAlertPanel';
import { usePhlebotomyDashboard } from '../hooks/usePhlebotomyAnalytics';
import type { PhlebotomyFilters } from '../services/phlebotomy.api';
import type { PhlebotomyKPI } from '../types/phlebotomy.types';
import { Syringe, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function PhlebotomyKPICard({ kpi }: { kpi: PhlebotomyKPI }) {
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

export function PhlebotomyDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<PhlebotomyFilters>({});
  const { data, isLoading } = usePhlebotomyDashboard(filters);

  useEffect(() => {
    setPageMeta('Assistant Phlebotomist', 'Safe sample collection, verification, and barcode labeling');
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
        <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Phlebotomy' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-pink-300 bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/25">
          <Syringe className="w-3.5 h-3.5" />
          COLLECTION & SAFETY
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <PhlebotomyKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Row 1: Queue & Prep */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[350px]">
          <PhlebotomyPatientQueue queue={d.patientQueue} />
        </div>
        <div className="xl:col-span-7 h-[350px]">
          <PhlebotomyPreparationPanel activePatient={d.activePatient} steps={d.verificationSteps} />
        </div>
      </div>

      {/* Row 2: Tubes, Handover, Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[350px]">
          <PhlebotomyLabelPanel activePatient={d.activePatient} tests={d.activeTests} />
        </div>
        <div className="xl:col-span-3 h-[350px]">
          <PhlebotomyHandoverPanel batches={d.handoverBatches} />
        </div>
        <div className="xl:col-span-3 h-[350px]">
          <PhlebotomyAlertPanel alerts={d.alerts} />
        </div>
      </div>
    </div>
  );
}
