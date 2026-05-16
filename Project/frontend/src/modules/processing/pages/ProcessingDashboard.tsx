'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ProcessingTaskQueue } from '../components/ProcessingTaskQueue';
import { ProcessingWorkspace } from '../components/ProcessingWorkspace';
import { ProcessingValidationPanel } from '../components/ProcessingValidationPanel';
import { useProcessingDashboard } from '../hooks/useProcessingAnalytics';
import type { ProcessingFilters } from '../services/processing.api';
import type { ProcessingKPI } from '../types/processing.types';
import { ServerCog, AlertTriangle } from 'lucide-react';

function ProcKPICard({ kpi }: { kpi: ProcessingKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function ProcessingDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<ProcessingFilters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data, isLoading } = useProcessingDashboard(filters);

  useEffect(() => { setPageMeta('Processing Officer', 'High-throughput execution — billing entries, validation, and back-office operations'); }, [setPageMeta]);

  // Keyboard shortcut for navigating tasks
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowDown' && data?.data) {
      e.preventDefault();
      const currentIndex = data.data.tasks.findIndex(t => t.id === selectedId);
      const nextIndex = currentIndex + 1 < data.data.tasks.length ? currentIndex + 1 : 0;
      if (data.data.tasks[nextIndex]) setSelectedId(data.data.tasks[nextIndex].id);
    }
  }, [data, selectedId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedTask = d.tasks.find(t => t.id === selectedId);

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Processing Desk' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <ServerCog className="w-3.5 h-3.5" /> EXECUTION ENGINE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <ProcKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <ProcessingTaskQueue tasks={d.tasks} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-6 h-[650px]">
          <ProcessingWorkspace task={selectedTask} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          <ProcessingValidationPanel issues={selectedTask?.validationIssues || []} logs={d.logs} />
        </div>
      </div>
    </div>
  );
}
