'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QueueToken } from '../types/frontDesk.types';
import { useCallNextToken, useSkipToken } from '../hooks/useFrontDeskAnalytics';
import { Users, Play, SkipForward, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { queue: QueueToken[]; }

const statusConfig: Record<QueueToken['status'], { bg: string; text: string; icon: React.ReactNode }> = {
  'In Progress': { bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-300', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  'Waiting':     { bg: 'bg-warning/10 border-warning/20', text: 'text-warning-light', icon: <Clock className="w-3.5 h-3.5" /> },
  'Completed':   { bg: 'bg-success/10 border-success/20', text: 'text-success-light', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'Skipped':     { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', icon: <SkipForward className="w-3.5 h-3.5" /> },
};

export function FrontDeskQueuePanel({ queue }: Props) {
  const { mutate: callNext, isPending: isCalling } = useCallNextToken();
  const { mutate: skip, isPending: isSkipping } = useSkipToken();
  const waitingCount = queue.filter(t => t.status === 'Waiting').length;

  return (
    <Card className="border-amber-500/25 shadow-glass bg-[#0a0804] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/15"><Users className="w-4 h-4 text-amber-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Live Token Queue</h3>
            <span className="text-[10px] text-gray-500 font-mono">{waitingCount} patients waiting</span>
          </div>
        </div>
        <Button 
          size="sm" 
          disabled={isCalling || waitingCount === 0}
          onClick={() => callNext('General')}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-9 px-4"
          leftIcon={<Play className="w-3.5 h-3.5"/>}
        >
          Call Next
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {queue.map((token) => {
            const cfg = statusConfig[token.status];
            return (
              <div key={token.id} className={cn("p-4 transition-colors", token.status === 'In Progress' ? "bg-blue-500/[0.04] border-l-3 border-l-blue-500" : "hover:bg-white/[0.015]")}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-[14px]", cfg.bg, cfg.text)}>
                      {token.tokenNumber}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-white">{token.patientName}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{token.department} • {token.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn("text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1", cfg.bg, cfg.text)}>
                      {cfg.icon} {token.status}
                    </span>
                    {token.status === 'Waiting' && (
                      <span className="text-[10px] text-gray-500 font-mono">~{token.estimatedWait}</span>
                    )}
                  </div>
                </div>

                {token.status === 'Waiting' && (
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                    <Button size="sm" disabled={isSkipping} onClick={() => skip(token.id)} className="h-7 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px]" leftIcon={<SkipForward className="w-3 h-3"/>}>
                      Skip
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          {queue.length === 0 && (
            <div className="p-10 text-center text-[13px] text-gray-500 font-bold">No patients in queue</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
