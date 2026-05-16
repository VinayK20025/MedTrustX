'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ControlPanel } from '../components/ControlPanel';
import { AuditWorkspace } from '../components/AuditWorkspace';
import { useAuditDashboard, useUpdateFindingStatus, useCloseCapaAction } from '../hooks/useAuditAnalytics';
import { FileSearch, AlertTriangle, Wrench, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

export const InternalAuditorDashboard: React.FC = () => {
  const { data, isLoading } = useAuditDashboard();
  const updateFinding = useUpdateFindingStatus();
  const closeCapa = useCloseCapaAction();
  const [activeControlId, setActiveControlId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading audit data...</div>;
  }

  const { data: auditData } = data;
  const hasCritical = auditData.metrics.criticalFindings > 0;

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Internal Governance' }, { label: 'Audit Dashboard' }]} />

        {/* Critical finding alert */}
        {hasCritical && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Critical Findings:</strong> {auditData.metrics.criticalFindings} critical control failure(s) require immediate escalation and CAPA.
            </span>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Audits Completed', value: auditData.metrics.auditsCompleted, icon: FileSearch, color: 'indigo' },
            { label: 'Open Findings', value: auditData.metrics.openFindings, icon: AlertTriangle, color: hasCritical ? 'red' : 'amber' },
            { label: 'CAPA Completion', value: `${auditData.metrics.capaCompletionRate}%`, icon: Wrench, color: 'emerald' },
            { label: 'Compliance Score', value: `${auditData.metrics.overallComplianceScore}%`, icon: ShieldCheck, color: 'teal' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left — Control Library */}
        <div className="lg:col-span-4 h-full">
          <ControlPanel
            controls={auditData.controls}
            activeControlId={activeControlId}
            onSelectControl={setActiveControlId}
          />
        </div>

        {/* Right — Audit Workspace */}
        <div className="lg:col-span-8 h-full">
          <AuditWorkspace
            data={auditData}
            activeControlId={activeControlId}
            onUpdateFinding={(id, status) => updateFinding.mutate({ id, status })}
            onCloseCapa={(id) => closeCapa.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
