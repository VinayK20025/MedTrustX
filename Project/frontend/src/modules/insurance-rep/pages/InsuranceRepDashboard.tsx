'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { CaseListPanel } from '../components/CaseListPanel';
import { InsuranceWorkspace } from '../components/InsuranceWorkspace';
import { useInsuranceRepDashboard } from '../hooks/useInsuranceRepAnalytics';
import type { InsuranceKPI } from '../types/insurance-rep.types';
import { Briefcase, AlertTriangle } from 'lucide-react';

function IrKPICard({ kpi }: { kpi: InsuranceKPI }) {
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

export function InsuranceRepDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useInsuranceRepDashboard({});
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Insurance Representative', 'Policy verification, pre-authorization decisions, claims processing, and financial clearance');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.cases && !selectedCaseId) {
      const pending = data.data.cases.find(c => c.status === 'Pre-Auth Pending');
      setSelectedCaseId(pending ? pending.id : data.data.cases[0]?.id);
    }
  }, [data, selectedCaseId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const pendingPreAuths = d.preAuths.filter(p => p.status === 'Pending').length;
  const casesWithMissingDocs = d.cases.filter(c => c.missingDocs.length > 0).length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {(pendingPreAuths > 0 || casesWithMissingDocs > 0) && (
        <div className="flex gap-3 flex-wrap">
          {pendingPreAuths > 0 && (
            <div className="bg-warning/20 border border-warning/40 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
              <AlertTriangle className="w-4 h-4 text-warning-light shrink-0" />
              <div>
                <span className="text-[11px] font-black text-warning-light uppercase tracking-widest">{pendingPreAuths} Pre-Auth Pending</span>
                <p className="text-[10px] text-orange-200 mt-0.5">Treatment cannot begin until authorization is granted.</p>
              </div>
            </div>
          )}
          {casesWithMissingDocs > 0 && (
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
              <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{casesWithMissingDocs} Cases Missing Documents</span>
                <p className="text-[10px] text-blue-200 mt-0.5">Claims cannot be processed until documentation is complete.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Financial Operations' }, { label: 'Insurance Liaison' }]} />
        <div className="text-[12px] font-bold text-green-400 flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/25">
          <Briefcase className="w-4 h-4" /> TPA Link Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <IrKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <CaseListPanel cases={d.cases} selectedId={selectedCaseId} onSelect={setSelectedCaseId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <InsuranceWorkspace preAuths={d.preAuths} claims={d.claims} />
        </div>
      </div>
    </div>
  );
}
