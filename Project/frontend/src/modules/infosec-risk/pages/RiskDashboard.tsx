'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RiskRegisterPanel } from '../components/RiskRegisterPanel';
import { RiskWorkspace } from '../components/RiskWorkspace';
import { useRiskDashboard, useAddMitigation } from '../hooks/useRiskAnalytics';
import { ShieldAlert, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export const RiskDashboard: React.FC = () => {
  const { data, isLoading } = useRiskDashboard();
  const addMitigation = useAddMitigation();
  const [activeRiskId, setActiveRiskId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading risk intelligence data...</div>;
  }

  const { data: riskData } = data;

  const handleAddMitigation = (riskId: string, action: string, assignee: string) => {
    addMitigation.mutate({ riskId, action, assignee });
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & KPIs */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Information Security' }, { label: 'Risk Manager Dashboard' }]} />

        {/* Real-time alert banner if critical */}
        {riskData.risks.some(r => r.riskLevel === 'Critical') && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span><strong>Alert:</strong> {riskData.risks.filter(r => r.riskLevel === 'Critical').length} critical-level risk(s) require immediate attention.</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Risks</p>
              <p className="text-2xl font-bold text-white">{riskData.metrics.totalRisks}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">High / Critical</p>
              <p className="text-2xl font-bold text-white">{riskData.metrics.highRiskCount}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Mitigated</p>
              <p className="text-2xl font-bold text-white">{riskData.metrics.mitigatedRisks}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Mitigation Progress</p>
              <p className="text-2xl font-bold text-white">{riskData.metrics.mitigationProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left — Risk Register */}
        <div className="lg:col-span-4 h-full">
          <RiskRegisterPanel
            risks={riskData.risks}
            activeRiskId={activeRiskId}
            onSelectRisk={setActiveRiskId}
          />
        </div>

        {/* Right — Risk Workspace */}
        <div className="lg:col-span-8 h-full">
          <RiskWorkspace
            data={riskData}
            activeRiskId={activeRiskId}
            onAddMitigation={handleAddMitigation}
          />
        </div>
      </div>
    </div>
  );
};
