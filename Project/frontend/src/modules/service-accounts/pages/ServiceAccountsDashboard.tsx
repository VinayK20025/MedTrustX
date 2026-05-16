'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AccountRegistryPanel } from '../components/AccountRegistryPanel';
import { IdentityWorkspace } from '../components/IdentityWorkspace';
import { useServiceAccountsDashboard, useRotateCredential, useSuspendAccount, useResolveAlert } from '../hooks/useServiceAccounts';
import { ShieldCheck, Key, AlertTriangle, FileText, Cpu } from 'lucide-react';

export const ServiceAccountsDashboard: React.FC = () => {
  const { data, isLoading } = useServiceAccountsDashboard();
  const rotate = useRotateCredential();
  const suspend = useSuspendAccount();
  const resolve = useResolveAlert();
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Machine Identity Platform...</div>;

  const { data: sa } = data;
  const criticalAlerts = sa.alerts.filter(a => a.severity === 'Critical' && !a.resolved);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Identity & Access' }, { label: 'Service Accounts (Machine Identities)' }]} />

        {criticalAlerts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Identity Threat:</strong> {criticalAlerts[0].issue} on account {criticalAlerts[0].accountId}. Immediate rotation required.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Active Identities', value: sa.metrics.totalAccounts, icon: Cpu, color: 'indigo' },
            { label: 'Active Keys', value: sa.metrics.activeKeys, icon: Key, color: 'emerald' },
            { label: 'Daily API Calls', value: `${(sa.metrics.dailyApiCalls / 1000000).toFixed(2)}M`, icon: FileText, color: 'indigo' },
            { label: 'Rotation Compliance', value: `${sa.metrics.rotationCompliance}%`, icon: ShieldCheck, color: sa.metrics.rotationCompliance > 98 ? 'teal' : 'amber' },
            { label: 'Failed Auths', value: sa.metrics.failedAuthAttempts, icon: AlertTriangle, color: sa.metrics.failedAuthAttempts > 10 ? 'rose' : 'emerald' },
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
          <AccountRegistryPanel
            accounts={sa.accounts}
            activeAccountId={activeAccountId}
            onSelectAccount={setActiveAccountId}
            onSuspendAccount={(id) => suspend.mutate({ accountId: id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <IdentityWorkspace
            data={sa}
            activeAccountId={activeAccountId}
            onRotateCredential={(id) => rotate.mutate({ accountId: id })}
            onResolveAlert={(id) => resolve.mutate({ alertId: id })}
          />
        </div>
      </div>
    </div>
  );
};
