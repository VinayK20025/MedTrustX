'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Shield, ShieldCheck, ShieldOff, AlertTriangle, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { FirewallRule, EndpointDevice } from '../types/security-engineer.types';

interface ControlsPanelProps {
  firewallRules: FirewallRule[];
  endpoints: EndpointDevice[];
  activeView: 'firewall' | 'endpoints';
  onToggleView: (v: 'firewall' | 'endpoints') => void;
  onToggleRule: (id: string) => void;
  onQuarantineEndpoint: (id: string) => void;
}

const epStatusColors: Record<string, string> = {
  Protected: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'At Risk': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Offline: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  Quarantined: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ firewallRules, endpoints, activeView, onToggleView, onToggleRule, onQuarantineEndpoint }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Security Controls"
        icon={<Shield className="w-4 h-4 text-indigo-400" />}
        action={
          <div className="flex gap-1">
            <button onClick={() => onToggleView('firewall')} className={cn("text-[9px] px-2 py-1 rounded border transition-colors",
              activeView === 'firewall' ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
            )}>Firewall</button>
            <button onClick={() => onToggleView('endpoints')} className={cn("text-[9px] px-2 py-1 rounded border transition-colors",
              activeView === 'endpoints' ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
            )}>EDR</button>
          </div>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        {activeView === 'firewall' ? (
          <div className="divide-y divide-white/[0.04]">
            {firewallRules.map(rule => (
              <div key={rule.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <h4 className="text-sm font-medium text-white leading-snug">{rule.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{rule.id}</p>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border",
                    rule.action === 'Deny' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    rule.action === 'Allow' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>{rule.action}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">{rule.direction}: </span>
                    <span className="text-gray-300 font-mono">{rule.source} → {rule.destination}</span>
                  </div>
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">Port: </span>
                    <span className="text-gray-300 font-mono">{rule.port}/{rule.protocol}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/[0.04]">
                  <span className="text-[9px] text-gray-500">Hits: <span className="text-white font-mono">{rule.hitCount.toLocaleString()}</span></span>
                  <Button size="sm" variant="outline" className={cn("h-6 px-2 text-[9px]",
                    rule.enabled ? "text-red-400 border-red-500/30 hover:bg-red-500/10" : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  )} onClick={() => onToggleRule(rule.id)}>
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {endpoints.map(ep => (
              <div key={ep.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-medium text-white">{ep.hostname}</h4>
                      <p className="text-[10px] text-gray-500">{ep.department}</p>
                    </div>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", epStatusColors[ep.status])}>
                    {ep.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">OS: </span><span className="text-gray-300">{ep.os}</span>
                  </div>
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">Agent: </span><span className={ep.edrAgent === 'Missing' ? "text-red-400" : "text-gray-300"}>{ep.edrAgent}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/[0.04]">
                  <span className="text-[9px] text-gray-500">Threats Blocked: <span className="text-white font-bold">{ep.threatsBlocked}</span></span>
                  {ep.status === 'At Risk' && (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => onQuarantineEndpoint(ep.id)}>
                      <ShieldOff className="w-2.5 h-2.5 mr-1" /> Quarantine
                    </Button>
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
