'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MicroSegmentationPolicy } from '../types/network.types';
import { useEnforcePolicy } from '../hooks/useNetworkAnalytics';
import { Network, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { policies: MicroSegmentationPolicy[]; }

export function NetworkSegmentationPanel({ policies }: Props) {
  const { mutate: enforce, isPending } = useEnforcePolicy();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Network className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Micro-Segmentation</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {policies.map(pol => (
            <div key={pol.id} className={cn("p-5 transition-colors", pol.policyStatus === 'Violation' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {pol.workloadName}
                    {pol.policyStatus === 'Violation' && <ShieldAlert className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">NS: {pol.namespace}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  pol.policyStatus === 'Enforced' ? 'bg-success/20 text-success-light' : 
                  pol.policyStatus === 'Simulation' ? 'bg-blue-500/20 text-blue-400' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {pol.policyStatus}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-4 text-[11px] font-mono">
                  <span className="text-gray-400">Ingress: <span className="text-white font-bold">{pol.ingressRules}</span></span>
                  <span className="text-gray-400">Egress: <span className="text-white font-bold">{pol.egressRules}</span></span>
                </div>
                
                {pol.policyStatus === 'Simulation' && (
                  <Button size="xs" onClick={() => enforce(pol.id)} disabled={isPending} className="h-7 text-[10px] bg-orange-600 hover:bg-orange-500 border-none font-bold text-white">
                    Enforce Rules
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
