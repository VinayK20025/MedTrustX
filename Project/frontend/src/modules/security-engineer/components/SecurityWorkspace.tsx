'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Lock, ShieldCheck, Network, Wrench, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { SecurityEngineerData } from '../types/security-engineer.types';

interface SecurityWorkspaceProps {
  data: SecurityEngineerData;
  onEnforcePolicy: (id: string, mode: string) => void;
}

export const SecurityWorkspace: React.FC<SecurityWorkspaceProps> = ({ data, onEnforcePolicy }) => {
  const [activeTab, setActiveTab] = useState('zta');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="Security Engineering Hub" subtitle="Policy Enforcement, Network Defense & Hardening" />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'zta', label: 'Zero Trust Policies', icon: <Lock className="w-4 h-4" /> },
            { id: 'network', label: 'IDS/IPS Events', icon: <Network className="w-4 h-4" /> },
            { id: 'hardening', label: 'System Hardening', icon: <Wrench className="w-4 h-4" /> },
          ]}
        />

        {/* ZERO TRUST POLICIES */}
        {activeTab === 'zta' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Zero Trust Architecture Policies
            </h3>
            <div className="grid gap-3">
              {data.ztaPolicies.map(policy => (
                <div key={policy.id} className={cn("bg-surface rounded-xl border p-4",
                  policy.enforcement === 'Enforcing' ? "border-emerald-500/20" :
                  policy.enforcement === 'Audit Mode' ? "border-amber-500/20 bg-amber-500/5" :
                  "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className={cn("w-4 h-4 mt-0.5 shrink-0",
                        policy.enforcement === 'Enforcing' ? "text-emerald-400" : "text-amber-400"
                      )} />
                      <div>
                        <h4 className="text-sm font-medium text-white">{policy.policyName}</h4>
                        <p className="text-xs text-gray-400 mt-1">{policy.description}</p>
                      </div>
                    </div>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold shrink-0 ml-2",
                      policy.enforcement === 'Enforcing' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      policy.enforcement === 'Audit Mode' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}>{policy.enforcement}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex gap-3 text-[10px]">
                      <span className="text-gray-500">Scope: <span className="text-indigo-300">{policy.scope}</span></span>
                      <span className="text-gray-500 border-l border-white/10 pl-3">Conditions: <span className="text-gray-300">{policy.conditions}</span></span>
                    </div>
                    {policy.enforcement === 'Audit Mode' && (
                      <Button size="sm" variant="outline" className="text-[9px] h-6 px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => onEnforcePolicy(policy.id, 'Enforcing')}>
                        Enforce
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IDS/IPS EVENTS */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Intrusion Detection & Prevention</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Event Type</th>
                    <th className="p-3 font-medium">Source → Dest</th>
                    <th className="p-3 font-medium">Severity</th>
                    <th className="p-3 font-medium">Action</th>
                    <th className="p-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.networkEvents.map(evt => (
                    <tr key={evt.id} className={cn("transition-colors",
                      evt.severity === 'Critical' ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-white/[0.02]"
                    )}>
                      <td className="p-3">
                        <span className={cn("text-xs font-medium",
                          evt.eventType === 'IPS Block' ? "text-red-400" :
                          evt.eventType === 'IDS Alert' ? "text-orange-400" :
                          "text-amber-400"
                        )}>{evt.eventType}</span>
                      </td>
                      <td className="p-3 text-[10px] font-mono text-gray-300">{evt.sourceIp} → {evt.destIp}</td>
                      <td className="p-3">
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold",
                          evt.severity === 'Critical' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          evt.severity === 'High' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>{evt.severity}</span>
                      </td>
                      <td className="p-3">
                        <span className={cn("text-[10px] flex items-center gap-1",
                          evt.action === 'Blocked' ? "text-emerald-400" : "text-gray-400"
                        )}>
                          {evt.action === 'Blocked' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {evt.action}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-gray-500 font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SYSTEM HARDENING */}
        {activeTab === 'hardening' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">CIS / NIST Hardening Baselines</h3>
            <div className="grid gap-3">
              {data.hardening.map(ctrl => (
                <div key={ctrl.id} className={cn("bg-surface rounded-xl border p-4 flex items-center justify-between",
                  ctrl.status === 'Failed' ? "border-red-500/30 bg-red-500/5" :
                  ctrl.status === 'Pending' ? "border-amber-500/20 bg-amber-500/5" :
                  "border-white/10"
                )}>
                  <div className="flex items-center gap-3">
                    {ctrl.status === 'Applied' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> :
                     ctrl.status === 'Pending' ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> :
                     <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    <div>
                      <h4 className="text-sm font-medium text-white">{ctrl.controlName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10">{ctrl.category}</span>
                        <span className="text-[9px] text-indigo-300">{ctrl.benchmark}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold",
                    ctrl.status === 'Applied' ? "text-emerald-400" :
                    ctrl.status === 'Pending' ? "text-amber-400" :
                    "text-red-400"
                  )}>{ctrl.status === 'Applied' ? '✔ Applied' : ctrl.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
