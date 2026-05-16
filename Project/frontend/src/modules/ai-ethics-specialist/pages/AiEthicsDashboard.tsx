'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ModelReviewPanel } from '../components/ModelReviewPanel';
import { EthicsWorkspace } from '../components/EthicsWorkspace';
import { useAiEthicsDashboard, useBlockModel, useApproveModel, useDismissEthicsAlert } from '../hooks/useAiEthicsAnalytics';
import { ShieldCheck, Scale, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

export const AiEthicsDashboard: React.FC = () => {
  const { data, isLoading } = useAiEthicsDashboard();
  const blockModel = useBlockModel();
  const approveModel = useApproveModel();
  const dismissAlert = useDismissEthicsAlert();
  const [activeModelId, setActiveModelId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading AI Ethics Platform...</div>;

  const { data: ethics } = data;
  const criticalAlerts = ethics.alerts.filter(a => a.severity === 'Critical');

  // Set default active model if none selected
  if (!activeModelId && ethics.models.length > 0) {
    setActiveModelId(ethics.models[0].id);
  }

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Governance' }, { label: 'AI Ethics Specialist Dashboard' }]} />

        {criticalAlerts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical Bias Incident:</strong> {criticalAlerts[0].description} Model deployment blocked pending ethics review.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Models Monitored', value: ethics.metrics.totalModelsMonitored, icon: Eye, color: 'indigo' },
            { label: 'Active Bias Alerts', value: ethics.metrics.biasAlertsActive, icon: Scale, color: ethics.metrics.biasAlertsActive > 0 ? 'rose' : 'gray' },
            { label: 'High-Risk Models', value: ethics.metrics.highRiskModels, icon: ShieldAlert, color: 'amber' },
            { label: 'XAI Coverage', value: `${ethics.metrics.explainabilityCoverage}%`, icon: Eye, color: ethics.metrics.explainabilityCoverage > 80 ? 'emerald' : 'amber' },
            { label: 'Compliance Score', value: `${ethics.metrics.complianceScore}%`, icon: ShieldCheck, color: ethics.metrics.complianceScore > 95 ? 'teal' : 'amber' },
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
          <ModelReviewPanel
            models={ethics.models}
            activeModelId={activeModelId}
            onSelectModel={setActiveModelId}
            onBlockModel={(id) => blockModel.mutate({ id })}
            onApproveModel={(id) => approveModel.mutate({ id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <EthicsWorkspace
            data={ethics}
            activeModelId={activeModelId}
            onDismissAlert={(id) => dismissAlert.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
