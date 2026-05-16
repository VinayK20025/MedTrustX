'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { DatasetListPanel } from '../components/DatasetListPanel';
import { DataWorkspace } from '../components/DataWorkspace';
import { useDataMgrDashboard } from '../hooks/useDataMgrAnalytics';
import type { DataMgrKPI } from '../types/data-manager.types';
import { Database, AlertTriangle } from 'lucide-react';

function DmKPICard({ kpi }: { kpi: DataMgrKPI }) {
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

export function DataMgrDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useDataMgrDashboard({});
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Data Manager', 'Clinical trial data integrity, validation engine, query resolution, and submission readiness');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.datasets && !selectedDatasetId) {
      const active = data.data.datasets.find(d => d.status === 'Active');
      setSelectedDatasetId(active ? active.id : data.data.datasets[0]?.id);
    }
  }, [data, selectedDatasetId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const openQueries = d.queries.filter(q => q.status === 'Open').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {openQueries > 0 && (
        <div className="bg-warning/20 border border-warning/40 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-warning-light uppercase tracking-widest">OPEN DATA QUERIES</span>
            <p className="text-[11px] text-orange-200 mt-0.5">{openQueries} discrepancy queries are unresolved. Datasets cannot be locked for regulatory submission until all queries are closed.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Research & Clinical Trials' }, { label: 'Data Management' }]} />
        <div className="text-[12px] font-bold text-violet-400 flex items-center gap-2 bg-violet-500/10 px-4 py-2 rounded-lg border border-violet-500/25">
          <Database className="w-4 h-4" /> EDC Sync Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <DmKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <DatasetListPanel datasets={d.datasets} selectedId={selectedDatasetId} onSelect={setSelectedDatasetId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <DataWorkspace rules={d.validationRules} queries={d.queries} selectedDatasetId={selectedDatasetId} />
        </div>
      </div>
    </div>
  );
}
