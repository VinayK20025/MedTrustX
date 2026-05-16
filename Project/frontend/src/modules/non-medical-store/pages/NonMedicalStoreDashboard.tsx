'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { BulkTasksPanel } from '../components/BulkTasksPanel';
import { BulkExecutionWorkspace } from '../components/BulkExecutionWorkspace';
import { useNmStoreDashboard } from '../hooks/useNonMedicalStoreAnalytics';
import type { NonMedicalKPI } from '../types/non-medical-store.types';
import { PackageOpen, AlertTriangle } from 'lucide-react';

function NmKPICard({ kpi }: { kpi: NonMedicalKPI }) {
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

export function NonMedicalStoreDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useNmStoreDashboard({});
  const [selectedReqId, setSelectedReqId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Non-Medical Storekeeper', 'Bulk execution of facility, administrative, and housekeeping supplies');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.requests && !selectedReqId) {
      if (data.data.requests.length > 0) setSelectedReqId(data.data.requests[0].id);
    }
  }, [data, selectedReqId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const lowStock = d.inventory.filter(e => e.status === 'Low');
  const selectedReq = d.requests.find(r => r.id === selectedReqId);

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {lowStock.length > 0 && (
        <div className="bg-warning/20 border border-warning/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-warning-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-warning-light uppercase tracking-widest">FACILITY SUPPLIES LOW</span>
            <p className="text-[11px] text-orange-200 mt-0.5">{lowStock.length} non-medical item(s) are running low. Verify bulk storage zones and trigger reorders if necessary.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Facility Operations' }, { label: 'General Store Execution' }]} />
        <div className="text-[12px] font-bold text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <PackageOpen className="w-4 h-4" /> Bulk Processing Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <NmKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <BulkTasksPanel requests={d.requests} selectedId={selectedReqId} onSelect={setSelectedReqId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <BulkExecutionWorkspace request={selectedReq} incoming={d.incoming} inventory={d.inventory} consumption={d.consumption} />
        </div>
      </div>
    </div>
  );
}
