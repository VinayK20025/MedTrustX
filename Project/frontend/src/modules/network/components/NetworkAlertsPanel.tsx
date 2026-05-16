'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NetworkSecurityThreat } from '../types/network.types';
import { useBlockNetworkThreat } from '../hooks/useNetworkAnalytics';
import { ShieldAlert, Shield, ShieldOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { threats: NetworkSecurityThreat[]; }

export function NetworkAlertsPanel({ threats }: Props) {
  const { mutate: blockThreat } = useBlockNetworkThreat();
  const activeThreats = threats.filter(t => t.status === 'Active');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col", activeThreats.length > 0 ? "border-emergency/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeThreats.length > 0 ? <ShieldAlert className="w-4 h-4 text-emergency-light animate-pulse" /> : <Shield className="w-4 h-4 text-indigo-400" />}
          <h3 className={cn("text-[13px] font-bold tracking-widest uppercase", activeThreats.length > 0 ? "text-emergency-light" : "text-indigo-400")}>Edge Security</h3>
        </div>
        {activeThreats.length > 0 && <span className="text-[9px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded font-bold">{activeThreats.length} Active</span>}
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto bg-black/40">
        <div className="divide-y divide-white/[0.03]">
           {threats.map(threat => (
             <div key={threat.id} className={cn("p-4", threat.status === 'Active' ? "bg-emergency/[0.05]" : "hover:bg-white/[0.02]")}>
               <div className="flex justify-between items-start mb-2">
                 <span className="text-[9px] text-gray-500 font-mono">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                 <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider", threat.status === 'Active' ? "bg-emergency/20 text-emergency-light" : "bg-white/10 text-gray-400")}>{threat.status}</span>
               </div>
               <p className={cn("text-[12px] font-bold", threat.status === 'Active' ? "text-emergency-light" : "text-white")}>{threat.type}</p>
               <div className="mt-2 text-[11px] font-mono flex flex-col gap-1">
                 <div className="flex justify-between text-gray-400"><span>Source IP:</span> <span className="text-white">{threat.sourceIp}</span></div>
                 <div className="flex justify-between text-gray-400"><span>Target:</span> <span className="text-indigo-300">{threat.targetSystem}</span></div>
               </div>
               
               {threat.status === 'Active' && (
                 <button onClick={() => blockThreat(threat.id)} className="mt-3 w-full justify-center text-[10px] font-bold bg-emergency/10 hover:bg-emergency/20 text-emergency-light border border-emergency/30 px-3 py-2 rounded flex items-center gap-1.5 transition-colors">
                   <ShieldOff className="w-3 h-3" /> Drop Packets & Block IP
                 </button>
               )}
             </div>
           ))}
        </div>
      </CardBody>
    </Card>
  );
}
