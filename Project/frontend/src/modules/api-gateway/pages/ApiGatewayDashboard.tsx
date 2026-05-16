'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ApiRegistryPanel } from '../components/ApiRegistryPanel';
import { GatewayWorkspace } from '../components/GatewayWorkspace';
import { useGatewayDashboard, useAcknowledgeGatewayAlert } from '../hooks/useGatewayAnalytics';
import { Activity, Shield, Clock, Siren, Server, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ApiGatewayDashboard: React.FC = () => {
  const { data, isLoading } = useGatewayDashboard();
  const ackAlert = useAcknowledgeGatewayAlert();
  const [activeApiId, setActiveApiId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading API Gateway...</div>;

  const { data: gwData } = data;
  const hasFiring = gwData.metrics.firingAlerts > 0;
  const hasHighError = gwData.apis.some(a => a.errorRate > 2);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'API Control' }, { label: 'Gateway Dashboard' }]} />
        {hasFiring && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
            <Siren className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span><strong>Gateway Alert:</strong> {gwData.metrics.firingAlerts} active alert(s) — Insurance Claims API error spike and SLA breach detected.</span>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Requests Today', value: (gwData.metrics.requestsToday / 1000).toFixed(1) + 'K', icon: Activity, color: 'indigo' },
            { label: 'Req / Hour', value: gwData.metrics.requestsPerHour.toLocaleString(), icon: Activity, color: 'teal' },
            { label: 'Error Rate', value: `${gwData.metrics.errorRate}%`, icon: XCircle, color: gwData.metrics.errorRate > 1 ? 'rose' : 'emerald' },
            { label: 'Avg Latency', value: `${gwData.metrics.avgLatencyMs}ms`, icon: Clock, color: 'amber' },
            { label: 'Active APIs', value: gwData.metrics.activeApis, icon: Server, color: 'purple' },
            { label: 'Blocked Req', value: gwData.metrics.blockedRequests, icon: Shield, color: 'rose' },
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
          <ApiRegistryPanel apis={gwData.apis} activeApiId={activeApiId} onSelectApi={setActiveApiId} />
        </div>
        <div className="lg:col-span-8 h-full">
          <GatewayWorkspace data={gwData} activeApiId={activeApiId} onAcknowledgeAlert={(id) => ackAlert.mutate({ id })} />
        </div>
      </div>
    </div>
  );
};
