'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { RepositoriesPanel } from '../components/RepositoriesPanel';
import { PullRequestsPanel } from '../components/PullRequestsPanel';
import { CommitsPanel } from '../components/CommitsPanel';
import { IssuesPanel } from '../components/IssuesPanel';
import { useGitea } from '../hooks/useGitea';
import { GitBranch, GitPullRequest, Workflow, Users, Code, Activity } from 'lucide-react';

interface GiteaKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function GiteaKPICard({ kpi }: { kpi: GiteaKPI }) {
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
        <div className="p-2 rounded-lg bg-green-500/15"><Icon className="w-4 h-4 text-green-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const GiteaDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useRepositories } = useGitea();
  const repoQuery = useRepositories();

  useEffect(() => {
    setPageMeta('Gitea Source Control', 'Self-hosted Git service for DHOS codebase management and CI/CD');
  }, [setPageMeta]);

  if (repoQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: GiteaKPI[] = [
    { id: 'repos', title: 'Repositories', value: 142, status: 'success', icon: GitBranch, subtitle: 'Active service repos' },
    { id: 'prs', title: 'Open Pull Requests', value: 23, status: 'normal', icon: GitPullRequest, subtitle: 'Awaiting review' },
    { id: 'pipelines', title: 'CI/CD Pipelines', value: 18, status: 'success', icon: Workflow, subtitle: 'Running builds' },
    { id: 'devs', title: 'Active Developers', value: 47, status: 'success', icon: Users, subtitle: 'Committed last 7d' },
    { id: 'commits', title: 'Commits (7d)', value: 342, status: 'normal', icon: Code, subtitle: 'Across all repos' },
    { id: 'build-pass', title: 'Build Pass Rate', value: '97.2%', status: 'success', icon: Activity, subtitle: 'Last 30 days' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Gitea Source Control' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-green-300 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/25">
          <GitBranch className="w-3.5 h-3.5" />
          SOURCE CONTROL & CI/CD
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <GiteaKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <RepositoriesPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <PullRequestsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <CommitsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <IssuesPanel />
        </div>
      </div>
    </div>
  );
};
