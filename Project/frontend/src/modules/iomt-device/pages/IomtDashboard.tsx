'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeviceRegistryPanel } from '../components/DeviceRegistryPanel';
import { IomtWorkspace } from '../components/IomtWorkspace';
import { useIomtDashboard, useApproveDevice, useRevokeCertificate, useResolveAlert } from '../hooks/useIomtAnalytics';
import { Server, Activity, ShieldCheck, AlertTriangle, Key } from 'lucide-react';

export const IomtDashboard: React.FC = () => {
  const { data, isLoading } = useIomtDashboard();
  const approve = useApproveDevice();
  const revoke = useRevokeCertificate();
  const resolve = useResolveAlert();
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading IoMT Platform...</div>;

  const { data: iomt } = data;
  const criticalAlerts = iomt.alerts.filter(a => a.severity === 'Critical' && !a.resolved);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Devices' }, { label: 'IoMT Device Platform' }]} />

        {criticalAlerts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Zero-Trust Alert:</strong> {criticalAlerts[0].issue} on {criticalAlerts[0].deviceId}. Data stream quarantined.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Active Devices', value: `${iomt.metrics.activeDevices} / ${iomt.metrics.totalDevices}`, icon: Server, color: 'indigo' },
            { label: 'Data Stream Rate', value: `${(iomt.metrics.dataTransmissionRate / 1000).toFixed(1)}k/min`, icon: Activity, color: 'emerald' },
            { label: 'Auth Success', value: `${iomt.metrics.authSuccessRate}%`, icon: Key, color: iomt.metrics.authSuccessRate > 99 ? 'teal' : 'amber' },
            { label: 'Incidents', value: iomt.metrics.securityIncidents, icon: ShieldCheck, color: iomt.metrics.securityIncidents > 0 ? 'rose' : 'emerald' },
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
          <DeviceRegistryPanel
            devices={iomt.devices}
            activeDeviceId={activeDeviceId}
            onSelectDevice={setActiveDeviceId}
            onApproveDevice={(id) => approve.mutate({ deviceId: id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <IomtWorkspace
            data={iomt}
            activeDeviceId={activeDeviceId}
            onRevokeCert={(id) => revoke.mutate({ deviceId: id })}
            onResolveAlert={(id) => resolve.mutate({ alertId: id })}
          />
        </div>
      </div>
    </div>
  );
};
