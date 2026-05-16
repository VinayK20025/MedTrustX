'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SecurePipelinePanel } from '../components/SecurePipelinePanel';
import { SecurityWorkspace } from '../components/SecurityWorkspace';
import { useDevSecOpsDashboard, useAcceptVulnerability, useTogglePolicy, useAcknowledgeSecAlert } from '../hooks/useDevSecOpsAnalytics';
import { Bug, Shield, ShieldAlert, Activity, Siren, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DevSecOpsDashboard: React.FC = () => {
  const { data, isLoading } = useDevSecOpsDashboard();
  const acceptVuln = useAcceptVulnerability();
  const togglePolicy = useTogglePolicy();
  const acknowledgeAlert = useAcknowledgeSecAlert();
  const [activePipelineId, setActivePipelineId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading security intelligence...</div>;
  }

  const { data: secData } = data;
  const hasCritical = secData.metrics.criticalVulnerabilities > 0;

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Engineering Security' }, { label: 'DevSecOps Dashboard' }]} />

        {/* Critical security alert banner */}
        {hasCritical && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Security Gate Blocked:</strong> {secData.metrics.criticalVulnerabilities} critical vulnerability(s) detected. {secData.metrics.blockedDeployments} deployment(s) blocked pending remediation.
            </span>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Scans Today', value: secData.metrics.scansToday, icon: Activity, color: 'indigo' },
            { label: 'Open Vulns', value: secData.metrics.openVulnerabilities, icon: Bug, color: 'amber' },
            { label: 'Critical', value: secData.metrics.criticalVulnerabilities, icon: ShieldAlert, color: hasCritical ? 'red' : 'gray' },
            { label: 'Pipeline Pass', value: `${secData.metrics.pipelinePassRate}%`, icon: Shield, color: secData.metrics.pipelinePassRate >= 90 ? 'emerald' : 'amber' },
            { label: 'Compliance', value: `${secData.metrics.complianceScore}%`, icon: Shield, color: 'teal' },
            { label: 'Blocked', value: secData.metrics.blockedDeployments, icon: Siren, color: 'rose' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface-dark border border-white/[0.06] rounded-xl p-3 flex items-center gap-2.5">
              <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left — Secure Pipeline List */}
        <div className="lg:col-span-4 h-full">
          <SecurePipelinePanel
            pipelines={secData.pipelines}
            activePipelineId={activePipelineId}
            onSelectPipeline={setActivePipelineId}
          />
        </div>

        {/* Right — Security Workspace */}
        <div className="lg:col-span-8 h-full">
          <SecurityWorkspace
            data={secData}
            activePipelineId={activePipelineId}
            onAcceptVuln={(id) => acceptVuln.mutate({ id })}
            onTogglePolicy={(id, status) => togglePolicy.mutate({ id, status })}
            onAcknowledgeAlert={(id) => acknowledgeAlert.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
