'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { InteroperabilityStatus } from '../types/him.types';
import { useTriggerInteropSync } from '../hooks/useHimAnalytics';
import { Network, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { interop: InteroperabilityStatus[]; }

export function HimInteroperabilityPanel({ interop }: Props) {
  const { mutate: sync, isPending } = useTriggerInteropSync();

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#05060a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-indigo-400">HL7 / FHIR INTEROPERABILITY</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {interop.map(sys => (
            <div key={sys.system} className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white mb-1">{sys.system}</h4>
                  <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-mono">{sys.protocol}</span>
                </div>
                <div className="text-right">
                  <span className={cn("text-[10px] uppercase font-bold flex items-center gap-1", 
                    sys.status === 'Online' ? 'text-success-light' : sys.status === 'Degraded' ? 'text-warning-light' : 'text-emergency-light'
                  )}>
                    {sys.status === 'Online' ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                    {sys.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 rounded-lg p-3 text-[11px] mb-3">
                 <div>
                    <span className="block text-gray-500 mb-1">Messages Processed</span>
                    <span className="font-mono text-white">{sys.messagesProcessed.toLocaleString()}</span>
                 </div>
                 <div>
                    <span className="block text-gray-500 mb-1">Error Rate</span>
                    <span className={cn("font-mono font-bold", sys.errorRate > 2 ? "text-emergency-light" : "text-success-light")}>{sys.errorRate}%</span>
                 </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                 <span>Last Sync: {new Date(sys.lastSync).toLocaleTimeString()}</span>
                 <Button 
                   size="sm" 
                   disabled={isPending}
                   onClick={() => sync(sys.system)}
                   className="h-7 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
                   leftIcon={<RefreshCw className="w-3 h-3"/>}
                 >
                   Force Sync
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
