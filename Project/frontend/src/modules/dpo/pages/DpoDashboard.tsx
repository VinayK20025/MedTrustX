'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RequestPanel } from '../components/RequestPanel';
import { PrivacyWorkspace } from '../components/PrivacyWorkspace';
import { useDpoDashboard, useUpdateRequestStatus, useUpdateBreachStatus } from '../hooks/useDpoAnalytics';
import { ClipboardList, Siren, Shield, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DpoDashboard: React.FC = () => {
  const { data, isLoading } = useDpoDashboard();
  const updateRequest = useUpdateRequestStatus();
  const updateBreach = useUpdateBreachStatus();
  const [activeRequestId, setActiveRequestId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading privacy governance data...</div>;
  }

  const { data: dpoData } = data;
  const openBreach = dpoData.breaches.some(b => b.status !== 'Closed');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Data Governance' }, { label: 'DPO Dashboard' }]} />

        {/* Breach Alert Banner */}
        {openBreach && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-rose-300">
            <Siren className="w-4 h-4 text-rose-400 shrink-0" />
            <span><strong>Active Breach:</strong> {dpoData.breaches.filter(b => b.status !== 'Closed').length} breach incident(s) require investigation. GDPR requires authority notification within 72 hours.</span>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Active DSRs', value: dpoData.metrics.activeRequests, icon: ClipboardList, color: 'indigo' },
            { label: 'Open Breaches', value: dpoData.metrics.openBreaches, icon: Siren, color: 'rose' },
            { label: 'Compliance', value: `${dpoData.metrics.complianceScore}%`, icon: Shield, color: 'emerald' },
            { label: 'Avg Response', value: `${dpoData.metrics.avgResponseTimeDays}d`, icon: Clock, color: 'amber' },
            { label: 'Pending DPIAs', value: dpoData.metrics.pendingDpias, icon: ClipboardList, color: 'purple' },
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
        {/* Left — Request Panel */}
        <div className="lg:col-span-4 h-full">
          <RequestPanel
            requests={dpoData.requests}
            activeRequestId={activeRequestId}
            onSelectRequest={setActiveRequestId}
          />
        </div>

        {/* Right — Privacy Workspace */}
        <div className="lg:col-span-8 h-full">
          <PrivacyWorkspace
            data={dpoData}
            activeRequestId={activeRequestId}
            onUpdateRequest={(id, status) => updateRequest.mutate({ id, status })}
            onUpdateBreach={(id, status) => updateBreach.mutate({ id, status })}
          />
        </div>
      </div>
    </div>
  );
};
