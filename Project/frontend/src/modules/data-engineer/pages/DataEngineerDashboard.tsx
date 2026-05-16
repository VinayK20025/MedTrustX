'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PipelinePanel } from '../components/PipelinePanel';
import { DataWorkspace } from '../components/DataWorkspace';
import { useDataDashboard, useRetryPipeline, useAcknowledgeDataAlert } from '../hooks/useDataAnalytics';
import { GitBranch, Database, BarChart3, AlertTriangle, Activity, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DataEngineerDashboard: React.FC = () => {
  const { data, isLoading } = useDataDashboard();
  const retry = useRetryPipeline();
  const ackAlert = useAcknowledgeDataAlert();
  const [activePipelineId, setActivePipelineId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading data pipelines...</div>;

  const { data: de } = data;
  const hasCritical = de.alerts.some(a => a.severity === 'Critical' && a.status === 'Firing');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Data Platform' }, { label: 'Data Engineering Dashboard' }]} />

        {hasCritical && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical Pipeline Failures:</strong> PHI masking pipeline down — potential HIPAA compliance risk. Billing ETL halted — {de.pipelines.find(p => p.id === 'PL-003')?.errorCount} data errors detected.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {[
            { label: 'Active Pipelines', value: de.metrics.pipelinesActive, icon: GitBranch, color: 'indigo' },
            { label: 'Success Rate', value: `${de.metrics.pipelineSuccessRate}%`, icon: Activity, color: de.metrics.pipelineSuccessRate >= 95 ? 'emerald' : 'amber' },
            { label: 'Records Today', value: `${(de.metrics.totalRecordsToday / 1_000_000).toFixed(1)}M`, icon: Database, color: 'teal' },
            { label: 'TB Processed', value: `${de.metrics.tbProcessedToday} TB`, icon: Database, color: 'purple' },
            { label: 'Avg Latency', value: `${de.metrics.avgLatencyMs}ms`, icon: Activity, color: 'amber' },
            { label: 'Failed', value: de.metrics.failedPipelines, icon: XCircle, color: de.metrics.failedPipelines > 0 ? 'red' : 'gray' },
            { label: 'Open Alerts', value: de.metrics.openAlerts, icon: AlertTriangle, color: de.metrics.openAlerts > 0 ? 'rose' : 'gray' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface-dark border border-white/[0.06] rounded-xl p-3 flex items-center gap-2.5">
              <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <p className="text-base font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-4 h-full">
          <PipelinePanel
            pipelines={de.pipelines}
            activePipelineId={activePipelineId}
            onSelectPipeline={setActivePipelineId}
            onRetry={(id) => retry.mutate({ id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <DataWorkspace
            data={de}
            activePipelineId={activePipelineId}
            onAcknowledgeAlert={(id) => ackAlert.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
