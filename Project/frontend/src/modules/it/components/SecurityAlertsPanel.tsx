'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SecurityLog } from '../types/it.types';
import { useBlockIp } from '../hooks/useItAnalytics';
import { ShieldAlert, Shield, ShieldOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { logs: SecurityLog[]; }

export function SecurityAlertsPanel({ logs }: Props) {
  const { mutate: blockIp } = useBlockIp();
  const threats = logs.filter(l => l.isThreat);

  return (
    <Card className={cn("shadow-glass h-full flex flex-col", threats.length > 0 ? "border-emergency/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {threats.length > 0 ? <ShieldAlert className="w-4 h-4 text-emergency-light animate-pulse" /> : <Shield className="w-4 h-4 text-emerald-400" />}
          <h3 className={cn("text-[13px] font-bold tracking-widest uppercase", threats.length > 0 ? "text-emergency-light" : "text-emerald-400")}>Security Logs</h3>
        </div>
        {threats.length > 0 && <span className="text-[9px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded font-bold">{threats.length} Threat(s)</span>}
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto bg-black/40">
        <div className="divide-y divide-white/[0.03]">
           {logs.map(log => (
             <div key={log.id} className={cn("p-4", log.isThreat ? "bg-emergency/[0.05]" : "hover:bg-white/[0.02]")}>
               <div className="flex justify-between items-start mb-2">
                 <span className="text-[9px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                 <span className="text-[10px] font-mono font-bold text-gray-400">{log.ipAddress}</span>
               </div>
               <p className={cn("text-[12px] font-bold", log.isThreat ? "text-emergency-light" : "text-white")}>{log.action}</p>
               <p className="text-[11px] text-gray-400 mt-0.5">User: <span className="text-blue-300">{log.user}</span></p>
               
               {log.isThreat && (
                 <button onClick={() => blockIp(log.ipAddress)} className="mt-3 text-[10px] font-bold bg-emergency/10 hover:bg-emergency/20 text-emergency-light border border-emergency/30 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
                   <ShieldOff className="w-3 h-3" /> Block IP at Firewall
                 </button>
               )}
             </div>
           ))}
        </div>
      </CardBody>
    </Card>
  );
}
