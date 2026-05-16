'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TpaCaseQueue } from '../components/TpaCaseQueue';
import { TpaPreAuthWorkspace } from '../components/TpaPreAuthWorkspace';
import { TpaStatusPanel } from '../components/TpaStatusPanel';
import { useTpaDashboard } from '../hooks/useTpaAnalytics';
import type { TpaFilters } from '../services/tpa.api';
import type { TpaKPI } from '../types/tpa.types';
import { BriefcaseMedical, AlertTriangle } from 'lucide-react';

function TpaKPICard({ kpi }: { kpi: TpaKPI }) {
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

export function TpaDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<TpaFilters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data, isLoading } = useTpaDashboard(filters);

  useEffect(() => { setPageMeta('TPA Coordinator', 'Cashless approvals, pre-auth orchestration, and discharge clearance'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedCase = d.cases.find(c => c.id === selectedId);
  const docs = selectedId ? d.documents[selectedId] || [] : [];
  const logs = selectedId ? d.logs[selectedId] || [] : [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Finance' }, { label: 'TPA Desk' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <BriefcaseMedical className="w-3.5 h-3.5" /> TPA COMMAND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <TpaKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <TpaCaseQueue cases={d.cases} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-6 h-[650px]">
          <TpaPreAuthWorkspace tpaCase={selectedCase} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          {selectedId ? <TpaStatusPanel documents={docs} logs={logs} /> : (
            <div className="h-full border border-white/[0.06] shadow-glass bg-surface-light rounded-xl flex items-center justify-center text-gray-500 text-[13px]">
              Select a case to view docs
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
