'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MriProtocol } from '../types/mriTech.types';
import { useEmergencyStop } from '../hooks/useMriTechAnalytics';
import { Activity, Disc, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeProtocol?: MriProtocol; }

export function MriTechScanPanel({ activeProtocol }: Props) {
  const { mutate: emergencyStop, isPending } = useEmergencyStop();

  if (!activeProtocol) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono relative overflow-hidden">
      <CardHeader className="border-b border-white/[0.04] p-3 flex items-center justify-between bg-black/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-blue-400">SEQUENCE EXECUTION</h3>
        </div>
        <Button size="sm" onClick={() => emergencyStop()} disabled={isPending} className="bg-emergency hover:bg-emergency-600 text-white font-black text-[11px] h-7 border-none shadow-[0_0_15px_rgba(239,68,68,0.4)]" leftIcon={<AlertOctagon className="w-3.5 h-3.5"/>}>
          EMERGENCY STOP
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 bg-white/[0.02] border-b border-white/5 mb-4">
           <h4 className="text-[14px] font-bold text-white mb-1 font-sans">{activeProtocol.name}</h4>
           <p className="text-[11px] text-gray-400 font-sans">{activeProtocol.description}</p>
        </div>

        <div className="px-4 space-y-4">
          {activeProtocol.sequences.map((seq, idx) => {
            const isScanning = seq.progressPercent !== undefined && seq.progressPercent > 0 && seq.progressPercent < 100;
            const isDone = seq.progressPercent === 100;
            
            return (
              <div key={seq.id} className={cn("p-4 rounded-xl border transition-all", 
                isScanning ? "bg-blue-500/10 border-blue-500/30" : 
                isDone ? "bg-white/[0.02] border-white/5 opacity-50" : "bg-surface-dark border-white/10"
              )}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <Disc className={cn("w-4 h-4", isScanning ? "text-blue-400 animate-spin" : "text-gray-500")} />
                    <h4 className={cn("text-[13px] font-bold", isScanning ? "text-white" : "text-gray-400")}>{idx + 1}. {seq.name}</h4>
                  </div>
                  <div className="text-[10px] text-gray-500">{seq.durationMinutes}m 00s</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-4">
                  <div className="bg-black/40 p-1.5 rounded text-center"><span className="text-gray-500 block">TR</span><span className="text-white">{seq.tr}ms</span></div>
                  <div className="bg-black/40 p-1.5 rounded text-center"><span className="text-gray-500 block">TE</span><span className="text-white">{seq.te}ms</span></div>
                  <div className="bg-black/40 p-1.5 rounded text-center"><span className="text-gray-500 block">Slice</span><span className="text-white">{seq.sliceThickness}</span></div>
                </div>

                {seq.progressPercent !== undefined && (
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", isDone ? "bg-gray-500" : "bg-blue-500")} style={{ width: `${seq.progressPercent}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
