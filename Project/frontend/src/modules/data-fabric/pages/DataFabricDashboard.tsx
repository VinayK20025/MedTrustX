'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { DataPipelinesPanel } from '../components/DataPipelinesPanel';
import { TransformationsPanel } from '../components/TransformationsPanel';
import { IntegrationEventsPanel } from '../components/IntegrationEventsPanel';
import { SchemaRegistryPanel } from '../components/SchemaRegistryPanel';
import { useDataFabric } from '../hooks/useDataFabric';
import { Database, Zap, Layers, RefreshCw, AlertTriangle, FileJson } from 'lucide-react';

interface FabricKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function FabricKPICard({ kpi }: { kpi: FabricKPI }) {
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
        <div className="p-2 rounded-lg bg-orange-500/15"><Icon className="w-4 h-4 text-orange-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const DataFabricDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { usePipelines } = useDataFabric();
  const pipelinesQuery = usePipelines();

  useEffect(() => {
    setPageMeta('Data Fabric', 'Unified data integration, ETL pipelines, and clinical data interoperability');
  }, [setPageMeta]);

  if (pipelinesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: FabricKPI[] = [
    { id: 'pipelines', title: 'Active Pipelines', value: 34, status: 'success', icon: Layers, subtitle: 'ETL/ELT jobs' },
    { id: 'throughput', title: 'Data Throughput', value: '42 GB/h', status: 'normal', icon: Zap, subtitle: 'Ingestion rate' },
    { id: 'syncs', title: 'Completed Syncs', value: '12.4K', status: 'success', icon: RefreshCw, subtitle: 'Last 24 hours' },
    { id: 'failures', title: 'Pipeline Failures', value: 2, status: 'warning', icon: AlertTriangle, subtitle: 'Requires review' },
    { id: 'sources', title: 'Data Sources', value: 18, status: 'normal', icon: Database, subtitle: 'EHR, LIS, PACS' },
    { id: 'schemas', title: 'Registered Schemas', value: 84, status: 'success', icon: FileJson, subtitle: 'FHIR/HL7 mapping' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Data Fabric' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-orange-300 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
          <Database className="w-3.5 h-3.5" />
          UNIFIED DATA PLATFORM
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <FabricKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <DataPipelinesPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <IntegrationEventsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <TransformationsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <SchemaRegistryPanel />
        </div>
      </div>
    </div>
  );
};
