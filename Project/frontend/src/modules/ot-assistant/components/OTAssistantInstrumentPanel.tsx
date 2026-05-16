'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { InstrumentRequest } from '../types/otAssistant.types';
import { useSupplyInstrument } from '../hooks/useOTAssistantAnalytics';
import { Scissors, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { requests: InstrumentRequest[]; }

export function OTAssistantInstrumentPanel({ requests }: Props) {
  const { mutate: supply, isPending } = useSupplyInstrument();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Scissors className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Live Instrument Requests</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.03]">
          {requests.map(req => (
            <div key={req.id} className={cn("p-5 transition-colors", req.priority === 'Urgent' && req.status !== 'Supplied' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {req.instrumentName}
                    {req.priority === 'Urgent' && req.status !== 'Supplied' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Requested by: {req.requestedBy}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  req.status === 'Supplied' ? 'bg-success/20 text-success-light' : 
                  req.status === 'Preparing' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400 animate-pulse'
                )}>
                  {req.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] text-gray-500 font-mono">{new Date(req.timeRequested).toLocaleTimeString()}</span>
                {req.status !== 'Supplied' ? (
                  <Button size="xs" onClick={() => supply(req.id)} disabled={isPending} className={cn("h-7 text-[10px] border-none font-bold text-white", req.priority === 'Urgent' ? "bg-emergency hover:bg-emergency-light" : "bg-orange-600 hover:bg-orange-500")}>
                    Supply to Sterile Field
                  </Button>
                ) : (
                  <span className="text-[10px] text-success-light flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3"/> Supplied</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
