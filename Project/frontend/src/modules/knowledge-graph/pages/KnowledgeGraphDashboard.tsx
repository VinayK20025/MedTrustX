'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { GraphNodesPanel } from '../components/GraphNodesPanel';
import { GraphEdgesPanel } from '../components/GraphEdgesPanel';
import { GraphQueriesPanel } from '../components/GraphQueriesPanel';
import { InferenceResultsPanel } from '../components/InferenceResultsPanel';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import { Network, Database, Zap, Sparkles, Share2, Activity } from 'lucide-react';

interface GraphKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function GraphKPICard({ kpi }: { kpi: GraphKPI }) {
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
        <div className="p-2 rounded-lg bg-pink-500/15"><Icon className="w-4 h-4 text-pink-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const KnowledgeGraphDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useNodes } = useKnowledgeGraph();
  const nodesQuery = useNodes();

  useEffect(() => {
    setPageMeta('Knowledge Graph', 'Semantic ontology mapping of clinical data, guidelines, and patient history');
  }, [setPageMeta]);

  if (nodesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: GraphKPI[] = [
    { id: 'nodes', title: 'Entities (Nodes)', value: '14.2M', status: 'success', icon: Database, subtitle: 'Patients, Drugs, Dx' },
    { id: 'edges', title: 'Relations (Edges)', value: '89.4M', status: 'success', icon: Share2, subtitle: 'Semantic links' },
    { id: 'queries', title: 'Graph Queries/s', value: 420, status: 'normal', icon: Zap, subtitle: 'SPARQL/Cypher load' },
    { id: 'latency', title: 'Avg Query Latency', value: '18ms', status: 'success', icon: Activity, subtitle: 'P95 response time' },
    { id: 'inference', title: 'Inferences Made', value: '1.2M', status: 'success', icon: Sparkles, subtitle: 'AI-derived insights' },
    { id: 'ontologies', title: 'Ontologies', value: 12, status: 'normal', icon: Network, subtitle: 'SNOMED, RxNorm, etc.' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Knowledge Graph' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-pink-300 bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/25">
          <Network className="w-3.5 h-3.5" />
          SEMANTIC ONTOLOGY
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <GraphKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <GraphNodesPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <GraphEdgesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <GraphQueriesPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <InferenceResultsPanel />
        </div>
      </div>
    </div>
  );
};
