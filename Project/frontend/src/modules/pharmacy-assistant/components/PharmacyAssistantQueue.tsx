'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PatientQueueItem } from '../types/pharmacyAssistant.types';
import { useCallNextPatient } from '../hooks/usePharmacyAssistantAnalytics';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { queue: PatientQueueItem[]; }

export function PharmacyAssistantQueue({ queue }: Props) {
  const { mutate: callNext, isPending } = useCallNextPatient();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Users className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Customer Queue</h3>
        </div>
        <Button 
          size="sm" 
          onClick={() => callNext()} 
          disabled={isPending}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold h-8 text-[11px]"
          rightIcon={<ArrowRight className="w-3.5 h-3.5"/>}
        >
          Call Next
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {queue.map(q => (
            <div key={q.id} className={cn("p-5 transition-colors cursor-pointer", q.status === 'Being Served' ? "bg-teal-500/5 border-l-2 border-teal-500" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[16px] font-black text-white font-mono">{q.ticketNumber}</h4>
                  <p className="text-[12px] text-gray-400 mt-1">{q.patientName}</p>
                </div>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded', 
                  q.requestType === 'Prescription Pickup' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                )}>
                  {q.requestType}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3">
                <span className={cn("text-[10px] uppercase font-bold", 
                     q.status === 'Being Served' ? 'text-teal-400' : 'text-gray-500'
                )}>{q.status}</span>
                <span className={cn("flex items-center gap-1 text-[10px] font-mono", q.waitTimeMinutes > 10 ? "text-warning-light" : "text-gray-500")}>
                  <Clock className="w-3 h-3" /> Wait: {q.waitTimeMinutes}m
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
