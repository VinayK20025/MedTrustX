'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NetworkVPC, NetworkSubnet } from '../types/network.types';
import { Cloud, Lock, Globe, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { vpcs: NetworkVPC[]; subnets: NetworkSubnet[]; }

export function NetworkTopologyPanel({ vpcs, subnets }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><Cloud className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">VPC Topology</h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        <div className="space-y-6">
          {vpcs.map(vpc => {
            const vpcSubnets = subnets.filter(s => s.vpcId === vpc.id);
            return (
              <div key={vpc.id} className="border border-white/5 rounded-xl bg-surface-dark overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                  <div>
                    <h4 className="text-[14px] font-bold text-emerald-400 flex items-center gap-2">
                      {vpc.name}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 font-mono">{vpc.cidr}</span>
                      <span className="text-[10px] text-gray-500 font-mono">| {vpc.region}</span>
                    </div>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    vpc.status === 'Active' ? 'bg-success/20 text-success-light' : 'bg-warning/20 text-warning-light'
                  )}>
                    {vpc.status}
                  </span>
                </div>
                
                <div className="p-4">
                  <h5 className="text-[10px] uppercase font-bold text-gray-500 mb-3 tracking-widest">Subnet Segments ({vpcSubnets.length})</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vpcSubnets.map(subnet => (
                      <div key={subnet.id} className="bg-white/5 p-3 rounded border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[12px] font-bold text-white flex items-center gap-1.5">
                            {subnet.accessLevel === 'Isolated' && <Shield className="w-3.5 h-3.5 text-emergency-light" />}
                            {subnet.accessLevel === 'Private' && <Lock className="w-3.5 h-3.5 text-blue-400" />}
                            {subnet.accessLevel === 'Public' && <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                            {subnet.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono mt-2">
                          <span className="text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">{subnet.cidr}</span>
                          <span className={cn('uppercase font-bold', 
                            subnet.accessLevel === 'Isolated' ? 'text-emergency-light' :
                            subnet.accessLevel === 'Private' ? 'text-blue-400' : 'text-emerald-400'
                          )}>{subnet.accessLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
