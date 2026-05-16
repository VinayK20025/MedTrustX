'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { InspectionListPanel } from '../components/InspectionListPanel';
import { InspectionWorkspace } from '../components/InspectionWorkspace';
import { useInspectorDashboard } from '../hooks/useInspectorAnalytics';
import type { InspectorKPI } from '../types/reg-inspector.types';
import { Shield, AlertTriangle } from 'lucide-react';

function InspKPICard({ kpi }: { kpi: InspectorKPI }) {
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

export function InspectorDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useInspectorDashboard({});
  const [selectedInspId, setSelectedInspId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Regulatory Inspector', 'Statutory compliance inspections, legal violation tracking, and enforcement action management');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.inspections && !selectedInspId) {
      const active = data.data.inspections.find(i => i.status === 'In Progress');
      setSelectedInspId(active ? active.id : data.data.inspections[0]?.id);
    }
  }, [data, selectedInspId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const criticalViolations = d.violations.filter(v => v.severity === 'Critical' && v.status === 'Open').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {criticalViolations > 0 && (
        <div className="bg-red-600/20 border border-red-600/40 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-red-400 uppercase tracking-widest">CRITICAL STATUTORY VIOLATIONS</span>
            <p className="text-[11px] text-red-200 mt-0.5">{criticalViolations} critical violation(s) detected. Enforcement action required per regulatory mandate.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Governance & Compliance' }, { label: 'Regulatory Inspection' }]} />
        <div className="text-[12px] font-bold text-red-400 flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/25">
          <Shield className="w-4 h-4" /> Inspection Authority Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <InspKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <InspectionListPanel inspections={d.inspections} selectedId={selectedInspId} onSelect={setSelectedInspId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <InspectionWorkspace checklist={d.checklist} violations={d.violations} actions={d.actions} />
        </div>
      </div>
    </div>
  );
}
