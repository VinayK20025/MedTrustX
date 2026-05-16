'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PipelinePanel } from '../components/PipelinePanel';
import { DeploymentWorkspace } from '../components/DeploymentWorkspace';
import { useDevOpsDashboard, useTriggerPipeline, useRollbackDeployment, useAcknowledgeAlert } from '../hooks/useDevOpsAnalytics';
import { GitBranch, Rocket, Activity, Clock, Siren } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DevOpsDashboard: React.FC = () => {
  const { data, isLoading } = useDevOpsDashboard();
  const trigger = useTriggerPipeline();
  const rollback = useRollbackDeployment();
  const acknowledge = useAcknowledgeAlert();
  const [activePipelineId, setActivePipelineId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Connecting to DevOps platform...</div>;
  }

  const { data: devopsData } = data;
  const hasFiringAlert = devopsData.metrics.firingAlerts > 0;
  const hasFailedPipeline = devopsData.pipelines.some(p => p.status === 'Failed');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Engineering' }, { label: 'DevOps Dashboard' }]} />

        {/* Alert banners */}
        {hasFiringAlert && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <Siren className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Production Alert:</strong> {devopsData.metrics.firingAlerts} firing alert(s) — critical service health issues detected.
            </span>
          </div>
        )}
        {hasFailedPipeline && !hasFiringAlert && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
            <GitBranch className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Pipeline Failure:</strong> {devopsData.pipelines.filter(p => p.status === 'Failed').length} pipeline(s) failed. Review security scan results.
            </span>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Deployments Today', value: devopsData.metrics.deploymentsToday, icon: Rocket, color: 'indigo' },
            { label: 'Success Rate', value: `${devopsData.metrics.successRate}%`, icon: Activity, color: 'emerald' },
            { label: 'System Uptime', value: `${devopsData.metrics.systemUptime}%`, icon: Activity, color: 'teal' },
            { label: 'MTTR', value: `${devopsData.metrics.mttrMinutes}m`, icon: Clock, color: 'amber' },
            { label: 'Firing Alerts', value: devopsData.metrics.firingAlerts, icon: Siren, color: hasFiringAlert ? 'red' : 'gray' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left — Pipeline List */}
        <div className="lg:col-span-4 h-full">
          <PipelinePanel
            pipelines={devopsData.pipelines}
            activePipelineId={activePipelineId}
            onSelectPipeline={setActivePipelineId}
            onRetrigger={(id) => trigger.mutate({ id })}
          />
        </div>

        {/* Right — Deployment Workspace */}
        <div className="lg:col-span-8 h-full">
          <DeploymentWorkspace
            data={devopsData}
            activePipelineId={activePipelineId}
            onRollback={(id) => rollback.mutate({ id })}
            onAcknowledgeAlert={(id) => acknowledge.mutate({ id })}
            onTriggerPipeline={(id) => trigger.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
