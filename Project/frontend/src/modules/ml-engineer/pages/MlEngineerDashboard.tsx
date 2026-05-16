'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ModelPanel } from '../components/ModelPanel';
import { MlWorkspace } from '../components/MlWorkspace';
import { useMlDashboard, useRetrainModel, useAcknowledgeMlAlert } from '../hooks/useMlAnalytics';
import { BrainCircuit, Cpu, Activity, ShieldAlert, GitBranch, Terminal } from 'lucide-react';

export const MlEngineerDashboard: React.FC = () => {
  const { data, isLoading } = useMlDashboard();
  const retrain = useRetrainModel();
  const ackAlert = useAcknowledgeMlAlert();
  const [activeModelId, setActiveModelId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading ML platform...</div>;

  const { data: ml } = data;
  const criticalAlerts = ml.alerts.filter(a => a.severity === 'Critical' && a.status === 'Active');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Data Platform' }, { label: 'AI/ML Engineer Dashboard' }]} />

        {criticalAlerts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical Drift Detected:</strong> Significant feature drift in {ml.models.find(m => m.id === criticalAlerts[0].modelId)?.name}. Automated retraining pipeline recommended.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Deployed Models', value: ml.metrics.modelsDeployed, icon: BrainCircuit, color: 'indigo' },
            { label: 'Inferences Today', value: `${(ml.metrics.totalInferencesToday / 1000).toFixed(0)}k`, icon: Activity, color: 'emerald' },
            { label: 'Avg Accuracy', value: `${ml.metrics.avgAccuracy}%`, icon: Terminal, color: ml.metrics.avgAccuracy >= 90 ? 'teal' : 'amber' },
            { label: 'Avg Latency', value: `${ml.metrics.avgInferenceLatency}ms`, icon: Activity, color: ml.metrics.avgInferenceLatency > 100 ? 'rose' : 'purple' },
            { label: 'Training Jobs', value: ml.metrics.trainingJobsRunning, icon: Cpu, color: 'amber' },
            { label: 'Active Alerts', value: ml.metrics.activeDriftAlerts, icon: ShieldAlert, color: ml.metrics.activeDriftAlerts > 0 ? 'rose' : 'gray' },
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
          <ModelPanel
            models={ml.models}
            activeModelId={activeModelId}
            onSelectModel={setActiveModelId}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <MlWorkspace
            data={ml}
            activeModelId={activeModelId}
            onRetrain={(id) => retrain.mutate({ id })}
            onAcknowledgeAlert={(id) => ackAlert.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
