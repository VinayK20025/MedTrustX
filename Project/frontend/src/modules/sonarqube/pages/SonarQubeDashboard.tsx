'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ProjectsPanel } from '../components/ProjectsPanel';
import { QualityGatesPanel } from '../components/QualityGatesPanel';
import { CodeIssuesPanel } from '../components/CodeIssuesPanel';
import { AnalysesPanel } from '../components/AnalysesPanel';
import { useSonarQube } from '../hooks/useSonarQube';
import { Bug, Shield, BarChart3, AlertTriangle, Code, Activity } from 'lucide-react';

interface SonarKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function SonarKPICard({ kpi }: { kpi: SonarKPI }) {
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
        <div className="p-2 rounded-lg bg-sky-500/15"><Icon className="w-4 h-4 text-sky-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const SonarQubeDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useProjects } = useSonarQube();
  const projectsQuery = useProjects();

  useEffect(() => {
    setPageMeta('SonarQube', 'Code quality and security analysis for all DHOS microservices');
  }, [setPageMeta]);

  if (projectsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: SonarKPI[] = [
    { id: 'projects', title: 'Scanned Projects', value: 139, status: 'success', icon: Code, subtitle: 'All microservices' },
    { id: 'bugs', title: 'Open Bugs', value: 34, status: 'warning', icon: Bug, subtitle: '12 critical severity' },
    { id: 'vulns', title: 'Vulnerabilities', value: 7, status: 'warning', icon: AlertTriangle, subtitle: '2 blocker, 5 critical' },
    { id: 'coverage', title: 'Avg Coverage', value: '82.4%', status: 'success', icon: BarChart3, subtitle: 'Unit test coverage' },
    { id: 'gates', title: 'Quality Gates', value: '94%', status: 'success', icon: Shield, subtitle: 'Projects passing' },
    { id: 'debt', title: 'Tech Debt', value: '18d', status: 'normal', icon: Activity, subtitle: 'Estimated remediation' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'SonarQube' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-sky-300 bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/25">
          <Bug className="w-3.5 h-3.5" />
          CODE QUALITY ANALYSIS
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <SonarKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <ProjectsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <QualityGatesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <CodeIssuesPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <AnalysesPanel />
        </div>
      </div>
    </div>
  );
};
