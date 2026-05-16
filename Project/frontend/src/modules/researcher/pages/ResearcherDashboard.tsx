'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { StudyListPanel } from '../components/StudyListPanel';
import { StudyWorkspace } from '../components/StudyWorkspace';
import { ResearchInsightsPanel } from '../components/ResearchInsightsPanel';
import { useResearcherDashboard } from '../hooks/useResearcherAnalytics';
import type { ResearcherKPI } from '../types/researcher.types';
import { FlaskConical, AlertTriangle } from 'lucide-react';

function ResKPICard({ kpi }: { kpi: ResearcherKPI }) {
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

export function ResearcherDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useResearcherDashboard({});
  const [selectedStudyId, setSelectedStudyId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Principal Investigator', 'Clinical trial design, multi-site oversight, regulatory compliance, and outcome analysis');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.studies && !selectedStudyId) {
      const active = data.data.studies.find(s => s.status === 'Active');
      setSelectedStudyId(active ? active.id : data.data.studies[0]?.id);
    }
  }, [data, selectedStudyId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedStudy = d.studies.find(s => s.id === selectedStudyId);
  const pendingApprovals = d.approvals.filter(a => a.status === 'Pending Review').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {pendingApprovals > 0 && (
        <div className="bg-warning/20 border border-warning/40 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-warning-light uppercase tracking-widest">REGULATORY ATTENTION REQUIRED</span>
            <p className="text-[11px] text-orange-200 mt-0.5">{pendingApprovals} ethics/regulatory approval(s) pending review. Enrollment may be impacted.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Research & Clinical Trials' }, { label: 'Principal Investigator' }]} />
        <div className="text-[12px] font-bold text-purple-400 flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/25">
          <FlaskConical className="w-4 h-4" /> Research Oversight Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <ResKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-3 h-full">
          <StudyListPanel studies={d.studies} selectedId={selectedStudyId} onSelect={setSelectedStudyId} />
        </div>
        <div className="xl:col-span-6 h-full">
          <StudyWorkspace study={selectedStudy} approvals={d.approvals} />
        </div>
        <div className="xl:col-span-3 h-full">
          <ResearchInsightsPanel insights={d.insights} />
        </div>
      </div>
    </div>
  );
}
