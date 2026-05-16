'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { LegalCasesPanel } from '../components/LegalCasesPanel';
import { CaseDocumentsPanel } from '../components/CaseDocumentsPanel';
import { CaseTasksPanel } from '../components/CaseTasksPanel';
import { ComplianceRecordsPanel } from '../components/ComplianceRecordsPanel';
import { useLegalCaseManagement } from '../hooks/useLegalCaseManagement';
import { Scale, FileText, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';

interface LegalKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function LegalKPICard({ kpi }: { kpi: LegalKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40', normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40', critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover', statusColors[kpi.status])}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-amber-500/15"><Icon className="w-4 h-4 text-amber-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const LegalCaseManagementDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useCases } = useLegalCaseManagement();
  const casesQuery = useCases();

  useEffect(() => {
    setPageMeta('Legal Case Management', 'Internal hospital counsel case tracking, compliance, and document discovery');
  }, [setPageMeta]);

  if (casesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: LegalKPI[] = [
    { id: 'cases', title: 'Active Cases', value: 42, status: 'normal', icon: Scale, subtitle: 'Litigation & compliance' },
    { id: 'docs', title: 'Discovery Docs', value: 1845, status: 'normal', icon: FileText, subtitle: 'Indexed records' },
    { id: 'tasks', title: 'Pending Tasks', value: 14, status: 'warning', icon: Clock, subtitle: 'Deadlines approaching' },
    { id: 'compliance', title: 'Compliance Checks', value: '100%', status: 'success', icon: CheckCircle, subtitle: 'Regulatory adherence' },
    { id: 'risk', title: 'High Risk Cases', value: 3, status: 'critical', icon: AlertCircle, subtitle: 'Board level visibility' },
    { id: 'precedents', title: 'Legal Precedents', value: 128, status: 'normal', icon: BookOpen, subtitle: 'Internal case law' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Case Management' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/25">
          <Scale className="w-3.5 h-3.5" />
          INTERNAL COUNSEL
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <LegalKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <LegalCasesPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <CaseTasksPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <CaseDocumentsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <ComplianceRecordsPanel />
        </div>
      </div>
    </div>
  );
};
