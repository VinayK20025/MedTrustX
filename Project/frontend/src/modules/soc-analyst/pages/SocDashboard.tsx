'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AlertFeedPanel } from '../components/AlertFeedPanel';
import { InvestigationWorkspace } from '../components/InvestigationWorkspace';
import { useSocDashboard, useAssignAlert, useUpdateIncidentStatus, useExecutePlaybook } from '../hooks/useSocAnalytics';
import { ShieldAlert, Crosshair, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SocDashboard: React.FC = () => {
  const { data, isLoading } = useSocDashboard();
  const assignAlert = useAssignAlert();
  const updateStatus = useUpdateIncidentStatus();
  const executePlaybook = useExecutePlaybook();
  const [activeIncidentId, setActiveIncidentId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Security Operations Center...</div>;

  const { data: soc } = data;
  const criticalAlerts = soc.alerts.filter(a => a.severity === 'Critical' && a.status === 'Unassigned');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Security Operations' }, { label: 'SOC Analyst Dashboard' }]} />

        {criticalAlerts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical Threat Unassigned:</strong> {criticalAlerts[0].ruleName} detected on {criticalAlerts[0].source}. Immediate triage required.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Active Incidents', value: soc.metrics.activeIncidents, icon: ShieldAlert, color: 'red' },
            { label: 'Alerts / Hr', value: soc.metrics.alertsPerHour, icon: Crosshair, color: 'orange' },
            { label: 'MTTD (Detect)', value: `${soc.metrics.mttdMinutes}m`, icon: Clock, color: soc.metrics.mttdMinutes < 5 ? 'teal' : 'amber' },
            { label: 'MTTR (Respond)', value: `${soc.metrics.mttrMinutes}m`, icon: Clock, color: soc.metrics.mttrMinutes < 20 ? 'teal' : 'amber' },
            { label: 'Intel Hits', value: soc.metrics.threatIntelHits, icon: ShieldCheck, color: 'indigo' },
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
          <AlertFeedPanel
            alerts={soc.alerts}
            incidents={soc.incidents}
            activeIncidentId={activeIncidentId}
            onSelectIncident={setActiveIncidentId}
            onAssignAlert={(id) => assignAlert.mutate({ alertId: id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <InvestigationWorkspace
            data={soc}
            activeIncidentId={activeIncidentId}
            onExecutePlaybook={(id) => executePlaybook.mutate({ playbookId: id })}
            onUpdateIncidentStatus={(id, status) => updateStatus.mutate({ incidentId: id, status })}
          />
        </div>
      </div>
    </div>
  );
};
