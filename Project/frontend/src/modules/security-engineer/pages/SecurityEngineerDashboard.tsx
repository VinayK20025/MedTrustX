'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ControlsPanel } from '../components/ControlsPanel';
import { SecurityWorkspace } from '../components/SecurityWorkspace';
import { useSecurityEngineerDashboard, useToggleFirewallRule, useQuarantineEndpoint, useEnforcePolicyMode } from '../hooks/useSecurityEngineer';
import { Shield, ShieldCheck, AlertTriangle, Lock, Monitor } from 'lucide-react';

export const SecurityEngineerDashboard: React.FC = () => {
  const { data, isLoading } = useSecurityEngineerDashboard();
  const toggleRule = useToggleFirewallRule();
  const quarantine = useQuarantineEndpoint();
  const enforcePolicy = useEnforcePolicyMode();
  const [controlsView, setControlsView] = useState<'firewall' | 'endpoints'>('firewall');

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Security Engineering Platform...</div>;

  const { data: sec } = data;
  const atRiskEndpoints = sec.endpoints.filter(e => e.status === 'At Risk');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Security Engineering' }, { label: 'Security Engineer Dashboard' }]} />

        {atRiskEndpoints.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Endpoint at Risk:</strong> {atRiskEndpoints[0].hostname} ({atRiskEndpoints[0].department}) — EDR last scan {new Date(atRiskEndpoints[0].lastScan).toLocaleDateString()}. Quarantine recommended.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Threats Detected', value: sec.metrics.threatsDetected, icon: AlertTriangle, color: 'red' },
            { label: 'Active Controls', value: sec.metrics.activeControls, icon: Shield, color: 'indigo' },
            { label: 'Attacks Blocked', value: sec.metrics.blockedAttacks, icon: ShieldCheck, color: 'emerald' },
            { label: 'Endpoint Coverage', value: `${sec.metrics.endpointCoverage}%`, icon: Monitor, color: sec.metrics.endpointCoverage > 95 ? 'teal' : 'amber' },
            { label: 'ZTA Enforcing', value: sec.metrics.ztaPoliciesEnforcing, icon: Lock, color: 'indigo' },
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
          <ControlsPanel
            firewallRules={sec.firewallRules}
            endpoints={sec.endpoints}
            activeView={controlsView}
            onToggleView={setControlsView}
            onToggleRule={(id) => toggleRule.mutate({ ruleId: id })}
            onQuarantineEndpoint={(id) => quarantine.mutate({ endpointId: id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <SecurityWorkspace
            data={sec}
            onEnforcePolicy={(id, mode) => enforcePolicy.mutate({ policyId: id, mode })}
          />
        </div>
      </div>
    </div>
  );
};
