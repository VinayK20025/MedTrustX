'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { MroRecordList } from '../components/MroRecordList';
import { MroCodingPanel } from '../components/MroCodingPanel';
import { MroValidationPanel } from '../components/MroValidationPanel';
import { useMroDashboard } from '../hooks/useMroAnalytics';
import type { MroFilters } from '../services/mro.api';
import type { MroKPI } from '../types/mro.types';
import { FileText, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function MroKPICard({ kpi }: { kpi: MroKPI }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
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
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
          {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3 text-emergency-light" />}
          {kpi.title}
        </p>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>
        {kpi.value.toLocaleString()}
      </p>
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function MroDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<MroFilters>({});
  const { data, isLoading } = useMroDashboard(filters);

  useEffect(() => {
    setPageMeta('Medical Records Officer', 'EHR completion validation, ICD/CPT coding, and compliance tracking');
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
        <Breadcrumbs items={[{ label: 'Health Information Management' }, { label: 'Medical Records Office' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25">
          <FileText className="w-3.5 h-3.5" />
          HIM GOVERNANCE
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <MroKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Main Orchestration Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Record Queue */}
        <div className="xl:col-span-3 h-[600px]">
          <MroRecordList records={d.records} />
        </div>
        
        {/* Core Coding Workstation */}
        <div className="xl:col-span-6 h-[600px]">
          <MroCodingPanel coding={d.activeCoding} />
        </div>

        {/* Validation & Compliance */}
        <div className="xl:col-span-3 h-[600px] flex flex-col gap-5">
           <div className="flex-1">
             <MroValidationPanel deficiencies={d.deficiencies} />
           </div>
           <div className="flex-1 bg-surface-light border border-white/[0.06] rounded-xl flex items-center justify-center p-6 text-center shadow-glass">
              <div>
                <p className="text-[13px] font-bold text-white mb-2">Record Requests</p>
                <p className="text-[11px] text-gray-400">Manage external EHR requests for insurance claims or legal subpoenas.</p>
                <Button className="mt-4 bg-white/5 border border-white/10 hover:bg-white/10 text-xs h-8">View Request Queue</Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
