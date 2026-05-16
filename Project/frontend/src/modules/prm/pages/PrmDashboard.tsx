'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PrmFeedbackPanel } from '../components/PrmFeedbackPanel';
import { PrmComplaintPanel } from '../components/PrmComplaintPanel';
import { PrmServiceQualityPanel } from '../components/PrmServiceQualityPanel';
import { usePrmDashboard } from '../hooks/usePrmAnalytics';
import type { PrmFilters } from '../services/prm.api';
import type { PrmKPI } from '../types/prm.types';
import { SmilePlus, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function PrmKPICard({ kpi }: { kpi: PrmKPI }) {
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
          {kpi.status === 'warning' && <AlertTriangle className="w-3 h-3 text-warning-light" />}
          {kpi.title}
        </p>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>
        {kpi.value.toLocaleString()}
      </p>
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-pink-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function PrmDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<PrmFilters>({});
  const { data, isLoading } = usePrmDashboard(filters);

  useEffect(() => {
    setPageMeta('Patient Relationship Manager', 'Hospital-wide patient satisfaction, feedback, and complaint resolution');
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
        <Breadcrumbs items={[{ label: 'Patient Experience' }, { label: 'Relationship Management' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-pink-300 bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/25">
          <SmilePlus className="w-3.5 h-3.5" />
          EXPERIENCE COMMAND
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <PrmKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Main Orchestration Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Live Feedback Stream */}
        <div className="xl:col-span-4 h-[600px]">
          <PrmFeedbackPanel feedback={d.recentFeedback} />
        </div>
        
        {/* Active Grievances */}
        <div className="xl:col-span-5 h-[600px]">
          <PrmComplaintPanel complaints={d.activeComplaints} />
        </div>

        {/* Quality Metrics */}
        <div className="xl:col-span-3 h-[600px] flex flex-col gap-5">
           <div className="flex-1">
             <PrmServiceQualityPanel metrics={d.qualityMetrics} />
           </div>
        </div>
      </div>
    </div>
  );
}
