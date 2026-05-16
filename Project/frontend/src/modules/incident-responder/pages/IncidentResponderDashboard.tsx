'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IncidentPanel } from '../components/IncidentPanel';
import { ResponseWorkspace } from '../components/ResponseWorkspace';
import { useIncidentResponderDashboard, useExecuteAction, useUpdatePhase } from '../hooks/useIncidentResponder';
import { ShieldAlert, Clock, ShieldCheck, AlertTriangle, RotateCcw } from 'lucide-react';

export const IncidentResponderDashboard: React.FC = () => {
  const { data, isLoading } = useIncidentResponderDashboard();
  const executeAction = useExecuteAction();
  const updatePhase = useUpdatePhase();
  const [activeIncidentId, setActiveIncidentId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Incident Response Center...</div>;

  const { data: ir } = data;
  const openBreaches = ir.incidents.filter(i => i.severity === 'Critical' && (i.phase === 'Containment' || i.phase === 'Detection' || i.phase === 'Analysis'));

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Security Operations' }, { label: 'Incident Responder' }]} />

        {openBreaches.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Active Breach:</strong> {openBreaches[0].title} — Currently in <strong>{openBreaches[0].phase}</strong> phase. Immediate action required.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Active Incidents', value: ir.metrics.activeIncidents, icon: ShieldAlert, color: 'red' },
            { label: 'MTTR', value: `${ir.metrics.mttrMinutes}m`, icon: Clock, color: ir.metrics.mttrMinutes < 30 ? 'teal' : 'amber' },
            { label: 'Containment Time', value: `${ir.metrics.containmentTimeMinutes}m`, icon: ShieldCheck, color: ir.metrics.containmentTimeMinutes < 15 ? 'teal' : 'amber' },
            { label: 'Recovery Rate', value: `${ir.metrics.recoverySuccessRate}%`, icon: RotateCcw, color: ir.metrics.recoverySuccessRate > 95 ? 'emerald' : 'amber' },
            { label: 'Open Breaches', value: ir.metrics.openBreaches, icon: AlertTriangle, color: ir.metrics.openBreaches > 0 ? 'rose' : 'emerald' },
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
          <IncidentPanel
            incidents={ir.incidents}
            activeIncidentId={activeIncidentId}
            onSelectIncident={setActiveIncidentId}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <ResponseWorkspace
            data={ir}
            activeIncidentId={activeIncidentId}
            onExecuteAction={(id) => executeAction.mutate({ actionId: id })}
            onUpdatePhase={(id, phase) => updatePhase.mutate({ incidentId: id, phase })}
          />
        </div>
      </div>
    </div>
  );
};
