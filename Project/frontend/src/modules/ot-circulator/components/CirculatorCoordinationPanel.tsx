'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CoordinationRequest } from '../types/circulator.types';
import { useFulfillRequest, useEscalateRequest } from '../hooks/useCirculatorAnalytics';
import { Radio, AlertTriangle, CheckCircle2, PhoneForwarded } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { requests: CoordinationRequest[]; }

export function CirculatorCoordinationPanel({ requests }: Props) {
  const { mutate: fulfill, isPending: isFulfilling } = useFulfillRequest();
  const { mutate: escalate, isPending: isEscalating } = useEscalateRequest();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Radio className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Live Request Queue</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.03]">
          {requests.map(req => (
            <div key={req.id} className={cn("p-5 transition-colors", req.priority === 'STAT' && req.status !== 'Fulfilled' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {req.type} Request
                    {(req.priority === 'STAT' || req.priority === 'Urgent') && req.status !== 'Fulfilled' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">From: {req.requestedBy}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  req.status === 'Fulfilled' ? 'bg-success/20 text-success-light' : 
                  req.status === 'Dispatched' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400 animate-pulse'
                )}>
                  {req.status}
                </span>
              </div>

              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <p className="text-[12px] font-bold text-gray-300">"{req.description}"</p>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-500 font-mono">{new Date(req.timeRequested).toLocaleTimeString()}</span>
                {req.status !== 'Fulfilled' ? (
                  <div className="flex gap-2">
                    <Button size="xs" variant="ghost" onClick={() => escalate(req.id)} disabled={isEscalating} className="h-7 text-[10px] text-gray-400 hover:text-white" leftIcon={<PhoneForwarded className="w-3 h-3"/>}>
                      Escalate
                    </Button>
                    <Button size="xs" onClick={() => fulfill(req.id)} disabled={isFulfilling} className={cn("h-7 text-[10px] border-none font-bold text-white", req.priority === 'STAT' ? "bg-emergency hover:bg-emergency-light" : "bg-orange-600 hover:bg-orange-500")}>
                      Mark Fulfilled
                    </Button>
                  </div>
                ) : (
                  <span className="text-[10px] text-success-light flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3"/> Fulfilled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
