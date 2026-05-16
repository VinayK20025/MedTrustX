'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { InterfacePanel } from '../components/InterfacePanel';
import { IntegrationWorkspace } from '../components/IntegrationWorkspace';
import { useIntegrationDashboard, useRetryMessage, useDiscardMessage, useToggleRoute } from '../hooks/useIntegrationAnalytics';
import { Activity, AlertTriangle, Network, Clock, Siren, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const IntegrationDashboard: React.FC = () => {
  const { data, isLoading } = useIntegrationDashboard();
  const retry = useRetryMessage();
  const discard = useDiscardMessage();
  const toggle = useToggleRoute();
  const [activeInterfaceId, setActiveInterfaceId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Connecting to integration engine...</div>;

  const { data: intData } = data;
  const hasDegraded = intData.interfaces.some(i => i.status !== 'Active');
  const hasFailed = intData.metrics.failedMessages > 0;

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Integration' }, { label: 'HL7/FHIR Dashboard' }]} />
        {hasFailed && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span><strong>Message Failures:</strong> {intData.metrics.failedMessages} message(s) in error queue — requires manual review or retry.</span>
          </div>
        )}
        {hasDegraded && !hasFailed && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Degraded Interface:</strong> {intData.interfaces.filter(i => i.status !== 'Active').length} interface(s) operating below SLA.</span>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Messages Today', value: intData.metrics.messagesToday.toLocaleString(), icon: Activity, color: 'indigo' },
            { label: 'Msg / Hour', value: intData.metrics.messagesPerHour.toLocaleString(), icon: Activity, color: 'teal' },
            { label: 'Error Rate', value: `${intData.metrics.errorRate}%`, icon: AlertTriangle, color: hasFailed ? 'red' : 'emerald' },
            { label: 'Avg Latency', value: `${intData.metrics.avgLatencyMs}ms`, icon: Clock, color: 'amber' },
            { label: 'Active Interfaces', value: intData.metrics.activeInterfaces, icon: Network, color: 'purple' },
            { label: 'Uptime', value: `${intData.metrics.uptimePercent}%`, icon: Activity, color: 'emerald' },
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
          <InterfacePanel interfaces={intData.interfaces} activeInterfaceId={activeInterfaceId} onSelectInterface={setActiveInterfaceId} />
        </div>
        <div className="lg:col-span-8 h-full">
          <IntegrationWorkspace
            data={intData}
            activeInterfaceId={activeInterfaceId}
            onRetry={(id) => retry.mutate({ id })}
            onDiscard={(id) => discard.mutate({ id })}
            onToggleRoute={(id, active) => toggle.mutate({ id, active })}
          />
        </div>
      </div>
    </div>
  );
};
