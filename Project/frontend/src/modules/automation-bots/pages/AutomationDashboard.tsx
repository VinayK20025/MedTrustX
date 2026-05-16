'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BotRegistryPanel } from '../components/BotRegistryPanel';
import { AutomationWorkspace } from '../components/AutomationWorkspace';
import { useAutomationDashboard, usePauseBot, useOverrideAction, useResolveIncident } from '../hooks/useAutomationBots';
import { Bot, PlayCircle, AlertTriangle, Workflow, ShieldCheck } from 'lucide-react';

export const AutomationDashboard: React.FC = () => {
  const { data, isLoading } = useAutomationDashboard();
  const pauseBot = usePauseBot();
  const overrideAction = useOverrideAction();
  const resolveIncident = useResolveIncident();
  const [activeBotId, setActiveBotId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Autonomous Operations...</div>;

  const { data: auto } = data;
  const criticalIncidents = auto.incidents.filter(a => a.severity === 'Critical' && !a.resolved);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Automation Layer' }, { label: 'Autonomous Agents & CI/CD' }]} />

        {criticalIncidents.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Automation Failure:</strong> {criticalIncidents[0].issue} reported by {criticalIncidents[0].botId}. Human intervention required.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Active Bots', value: auto.metrics.activeBots, icon: Bot, color: 'indigo' },
            { label: 'Jobs Executed', value: auto.metrics.totalJobsExecuted, icon: PlayCircle, color: 'emerald' },
            { label: 'Success Rate', value: `${auto.metrics.successRate}%`, icon: ShieldCheck, color: auto.metrics.successRate > 95 ? 'teal' : 'amber' },
            { label: 'Anomalies', value: auto.metrics.anomaliesDetected, icon: AlertTriangle, color: auto.metrics.anomaliesDetected > 5 ? 'rose' : 'amber' },
            { label: 'Overrides', value: auto.metrics.humanOverrides, icon: Workflow, color: 'purple' },
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
          <BotRegistryPanel
            bots={auto.bots}
            activeBotId={activeBotId}
            onSelectBot={setActiveBotId}
            onPauseBot={(id) => pauseBot.mutate({ botId: id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <AutomationWorkspace
            data={auto}
            activeBotId={activeBotId}
            onOverrideAction={(id) => overrideAction.mutate({ actionId: id })}
            onResolveIncident={(id) => resolveIncident.mutate({ incidentId: id })}
          />
        </div>
      </div>
    </div>
  );
};
