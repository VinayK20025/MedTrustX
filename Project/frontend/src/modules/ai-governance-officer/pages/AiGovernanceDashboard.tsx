'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GovernancePanel } from '../components/GovernancePanel';
import { GovernanceWorkspace } from '../components/GovernanceWorkspace';
import { useAiGovernanceDashboard, useApproveGovernanceModel, useRejectGovernanceModel, useInitiateAudit } from '../hooks/useAiGovernanceAnalytics';
import { ShieldCheck, BrainCircuit, AlertTriangle, Scale, Clock } from 'lucide-react';

export const AiGovernanceDashboard: React.FC = () => {
  const { data, isLoading } = useAiGovernanceDashboard();
  const approve = useApproveGovernanceModel();
  const reject = useRejectGovernanceModel();
  const audit = useInitiateAudit();
  const [activeModelId, setActiveModelId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Governance Platform...</div>;

  const { data: gov } = data;
  const criticalRisks = gov.risks.filter(r => r.severity === 'High' && r.status === 'Open');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'AI Governance' }, { label: 'Governance Officer Dashboard' }]} />

        {criticalRisks.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical AI Risk Open:</strong> {criticalRisks[0].description} Immediate governance action required for {criticalRisks[0].affectedModelId}.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Models in Gov.', value: gov.metrics.totalModels, icon: BrainCircuit, color: 'indigo' },
            { label: 'Pending Approvals', value: gov.metrics.pendingApprovals, icon: Clock, color: gov.metrics.pendingApprovals > 0 ? 'amber' : 'gray' },
            { label: 'Compliance Score', value: `${gov.metrics.complianceScore}%`, icon: ShieldCheck, color: gov.metrics.complianceScore >= 95 ? 'teal' : 'amber' },
            { label: 'Bias Incidents', value: gov.metrics.biasIncidents, icon: Scale, color: gov.metrics.biasIncidents > 0 ? 'rose' : 'emerald' },
            { label: 'Open Risks', value: gov.metrics.openRisks, icon: AlertTriangle, color: gov.metrics.openRisks > 0 ? 'rose' : 'emerald' },
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
          <GovernancePanel
            models={gov.models}
            activeModelId={activeModelId}
            onSelectModel={setActiveModelId}
            onApprove={(id) => approve.mutate({ id })}
            onReject={(id) => reject.mutate({ id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <GovernanceWorkspace
            data={gov}
            activeModelId={activeModelId}
            onInitiateAudit={(id) => audit.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
