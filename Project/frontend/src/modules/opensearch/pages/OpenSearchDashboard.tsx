'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { SearchIndicesPanel } from '../components/SearchIndicesPanel';
import { SearchQueriesPanel } from '../components/SearchQueriesPanel';
import { IndexedDocumentsPanel } from '../components/IndexedDocumentsPanel';
import { useOpenSearch } from '../hooks/useOpenSearch';
import { Search, Database, Activity, HardDrive, Zap, BarChart3 } from 'lucide-react';

interface OpenSearchKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function OpenSearchKPICard({ kpi }: { kpi: OpenSearchKPI }) {
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
        <div className="p-2 rounded-lg bg-blue-500/15"><Icon className="w-4 h-4 text-blue-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const OpenSearchDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useIndices } = useOpenSearch();
  const indicesQuery = useIndices();

  useEffect(() => {
    setPageMeta('OpenSearch', 'Full-text search engine, clinical document indexing, and log analytics');
  }, [setPageMeta]);

  if (indicesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: OpenSearchKPI[] = [
    { id: 'docs', title: 'Total Documents', value: '48.7M', status: 'normal', icon: Database, subtitle: 'Indexed clinical records' },
    { id: 'indices', title: 'Active Indices', value: 94, status: 'success', icon: HardDrive, subtitle: 'Across all domains' },
    { id: 'qps', title: 'Queries/sec', value: '1.2K', status: 'success', icon: Zap, subtitle: 'Search throughput' },
    { id: 'latency', title: 'Avg Query Time', value: '24ms', status: 'success', icon: Activity, subtitle: 'P95 latency' },
    { id: 'storage', title: 'Index Storage', value: '320 GB', status: 'normal', icon: HardDrive, subtitle: '3 replica shards' },
    { id: 'health', title: 'Cluster Health', value: 'GREEN', status: 'success', icon: BarChart3, subtitle: '5 nodes active' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'OpenSearch' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <Search className="w-3.5 h-3.5" />
          SEARCH & ANALYTICS ENGINE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <OpenSearchKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <SearchIndicesPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <IndexedDocumentsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <SearchQueriesPanel />
      </div>
    </div>
  );
};
