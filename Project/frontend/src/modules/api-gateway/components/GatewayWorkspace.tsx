'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Shield, Lock, Activity, ToggleRight, ToggleLeft, Siren, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { GatewayData, GatewayApi } from '../types/gateway.types';

interface GatewayWorkspaceProps {
  data: GatewayData;
  activeApiId?: string;
  onAcknowledgeAlert: (id: string) => void;
}

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  POST: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  ANY: 'bg-white/5 text-gray-300 border-white/10',
};

export const GatewayWorkspace: React.FC<GatewayWorkspaceProps> = ({ data, activeApiId, onAcknowledgeAlert }) => {
  const [activeTab, setActiveTab] = useState('traffic');
  const api = data.apis.find(a => a.id === activeApiId) || data.apis[0];
  const apiRoutes = data.routes.filter(r => r.apiId === api?.id);
  const apiRateLimit = data.rateLimits.find(r => r.apiId === api?.id);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={api?.name || 'Gateway Control'}
        subtitle={api ? `${api.basePath} · v${api.version} · ${api.upstreamService}` : 'Select an API'}
        action={
          api && (
            <div className="flex gap-2">
              <span className={cn("text-xs px-2 py-1 rounded-lg border",
                api.errorRate > 1 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}>{api.errorRate}% err</span>
              <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded-lg">{api.consumers} consumers</span>
            </div>
          )
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'traffic', label: 'Traffic & Routes', icon: <Activity className="w-4 h-4" /> },
            { id: 'security', label: 'Security Policies', icon: <Shield className="w-4 h-4" />, count: data.securityPolicies.filter(s => s.status === 'Enabled').length },
            { id: 'ratelimits', label: 'Rate Limits', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'alerts', label: 'Alerts', icon: <Siren className="w-4 h-4" />, count: data.alerts.filter(a => a.status === 'Firing').length },
          ]}
        />

        {activeTab === 'traffic' && (
          <div className="space-y-6">
            {api && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Requests Today', value: api.requestsToday.toLocaleString() },
                  { label: 'Avg Latency', value: `${api.avgLatencyMs}ms`, warn: api.avgLatencyMs > 300 },
                  { label: 'Error Rate', value: `${api.errorRate}%`, warn: api.errorRate > 1 },
                  { label: 'Rate Limit', value: `${api.rateLimitPerMin}/min` },
                ].map(({ label, value, warn }) => (
                  <div key={label} className="bg-surface rounded-xl border border-white/10 p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                    <p className={cn("text-lg font-bold", warn ? "text-amber-400" : "text-white")}>{value}</p>
                  </div>
                ))}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Routes & Load Balancing</h3>
              {(apiRoutes.length > 0 ? apiRoutes : data.routes).map(route => (
                <div key={route.id} className={cn("bg-surface rounded-xl border p-4 mb-3",
                  route.healthStatus === 'Degraded' ? "border-amber-500/20" :
                  route.healthStatus === 'Down' ? "border-red-500/20" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono", methodColors[route.method])}>{route.method}</span>
                      <code className="text-sm font-mono text-white">{route.path}</code>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <div className={cn("w-1.5 h-1.5 rounded-full",
                        route.healthStatus === 'Healthy' ? "bg-emerald-400" :
                        route.healthStatus === 'Degraded' ? "bg-amber-400 animate-pulse" : "bg-red-400"
                      )} />
                      <span className={cn("text-[10px] font-bold",
                        route.healthStatus === 'Healthy' ? "text-emerald-400" :
                        route.healthStatus === 'Degraded' ? "text-amber-400" : "text-red-400"
                      )}>{route.healthStatus}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>→ <span className="font-mono text-teal-300">{route.destination}</span></span>
                    <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">{route.loadBalancer}</span>
                    <span>{route.callsToday.toLocaleString()} calls/day</span>
                    <span className={cn(route.avgLatencyMs > 300 ? "text-amber-400" : "")}>{route.avgLatencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Security Policies — Zero Trust Enforcement</h3>
            {data.securityPolicies.map(policy => (
              <div key={policy.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <h4 className="text-sm font-medium text-white">{policy.name}</h4>
                    </div>
                    <p className="text-xs text-gray-400">Scope: {policy.scope}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    {policy.status === 'Enabled'
                      ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                      : <ToggleLeft className="w-5 h-5 text-gray-500" />
                    }
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className={cn("px-1.5 py-0.5 rounded border font-bold",
                    policy.status === 'Enabled' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    "bg-gray-500/10 text-gray-400 border-white/10"
                  )}>{policy.status}</span>
                  {policy.blockedToday > 0 && (
                    <span className="text-rose-400">Blocked <strong>{policy.blockedToday}</strong> requests today</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ratelimits' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Rate Limiting & Throttle Policies</h3>
            {data.rateLimits.map(rl => (
              <div key={rl.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-white">{rl.apiName}</h4>
                    <p className="text-[10px] text-gray-500">{rl.limitPerMin} req/min · {rl.limitPerDay.toLocaleString()} req/day</p>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border",
                    rl.action === 'Block' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    rl.action === 'Throttle' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-teal-500/10 text-teal-400 border-teal-500/20"
                  )}>{rl.action}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500">Current Usage</span>
                    <span className={cn("font-bold",
                      rl.currentUsagePct >= 90 ? "text-red-400" :
                      rl.currentUsagePct >= 70 ? "text-amber-400" : "text-emerald-400"
                    )}>{rl.currentUsagePct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all",
                      rl.currentUsagePct >= 90 ? "bg-red-500" :
                      rl.currentUsagePct >= 70 ? "bg-amber-500" : "bg-emerald-500"
                    )} style={{ width: `${rl.currentUsagePct}%` }} />
                  </div>
                </div>
                {rl.throttledToday > 0 && (
                  <p className="text-[10px] text-amber-400">⚠ Throttled <strong>{rl.throttledToday}</strong> requests today</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {data.alerts.map(alert => (
              <div key={alert.id} className={cn("bg-surface rounded-xl border p-4",
                alert.severity === 'Critical' && alert.status === 'Firing' ? "border-red-500/30 bg-red-500/5" :
                alert.severity === 'High' ? "border-amber-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded shrink-0 mt-0.5",
                      alert.severity === 'Critical' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                    )}><Siren className="w-4 h-4" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{alert.apiName} · {alert.type}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border ml-3 shrink-0 font-bold",
                    alert.status === 'Firing' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>{alert.status}</span>
                </div>
                <p className="text-xs text-gray-300 mb-3 leading-relaxed">{alert.details}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">{new Date(alert.firedAt).toLocaleTimeString()}</p>
                  {alert.status === 'Firing' && (
                    <Button size="sm" variant="outline" className="text-[10px] border-white/10 text-white h-7 px-2"
                      onClick={() => onAcknowledgeAlert(alert.id)}>Acknowledge</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
