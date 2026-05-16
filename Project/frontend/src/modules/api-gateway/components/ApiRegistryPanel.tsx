'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Server, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { GatewayApi, AuthMethod } from '../types/gateway.types';

interface ApiRegistryPanelProps {
  apis: GatewayApi[];
  activeApiId?: string;
  onSelectApi?: (id: string) => void;
}

const authColors: Record<AuthMethod, string> = {
  OAuth2: 'bg-indigo-500/20 text-indigo-300',
  'API Key': 'bg-amber-500/20 text-amber-300',
  JWT: 'bg-teal-500/20 text-teal-300',
  mTLS: 'bg-purple-500/20 text-purple-300',
  None: 'bg-gray-500/20 text-gray-400',
};

export const ApiRegistryPanel: React.FC<ApiRegistryPanelProps> = ({ apis, activeApiId, onSelectApi }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="API Registry"
        icon={<Server className="w-4 h-4" />}
        action={
          <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
            {apis.filter(a => a.status === 'Active').length} Active
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {apis.map(api => (
            <div
              key={api.id}
              onClick={() => onSelectApi?.(api.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeApiId === api.id ? "bg-white/[0.04] border-l-indigo-500" :
                api.errorRate > 1 ? "border-l-amber-500" :
                api.status === 'Deprecated' ? "border-l-gray-600" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                      api.status === 'Active' ? "bg-emerald-400" :
                      api.status === 'Deprecated' ? "bg-gray-400" : "bg-amber-400"
                    )} />
                    <p className="text-[10px] font-mono text-gray-500">{api.id} · {api.version}</p>
                  </div>
                  <h4 className="text-sm font-medium text-white">{api.name}</h4>
                  <p className="text-[10px] font-mono text-gray-500 mt-0.5">{api.basePath}</p>
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0", authColors[api.authMethod])}>
                  {api.authMethod}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {api.tags.map(tag => (
                  <span key={tag} className="text-[9px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Req/day', value: (api.requestsToday / 1000).toFixed(1) + 'K' },
                  { label: 'Latency', value: `${api.avgLatencyMs}ms`, warn: api.avgLatencyMs > 300 },
                  { label: 'Errors', value: `${api.errorRate}%`, warn: api.errorRate > 1 },
                ].map(({ label, value, warn }) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] text-gray-500">{label}</p>
                    <p className={cn("text-xs font-bold", warn ? "text-amber-400" : "text-white")}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
