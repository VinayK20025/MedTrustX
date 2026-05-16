'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TriagePatient } from '../types/triage.types';
import { Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { queue: TriagePatient[]; }

export function TriageIncomingQueue({ queue }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Incoming Arrivals</h3>
        </div>
        <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded">
          {queue.length} WAITING
        </span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto">
        {queue.map(p => (
          <div key={p.id} className="p-4 rounded-xl border border-white/[0.06] bg-surface-dark hover:border-indigo-500/30 transition-colors group">
             <div className="flex justify-between items-start mb-2">
               <div>
                 <span className="text-sm font-bold text-white block">{p.name}</span>
                 <span className="text-[11px] text-gray-500 uppercase tracking-widest">{p.age} YRS • {p.arrivalTime}</span>
               </div>
               <div className="flex items-center gap-1 text-xs text-warning-light bg-warning/10 px-2 py-1 rounded font-mono border border-warning/20">
                 <Clock className="w-3 h-3" /> {p.waitTimeMins}m
               </div>
             </div>
             
             <p className="text-xs text-gray-300 bg-white/[0.02] p-2 rounded border border-white/[0.02]">
               {p.complaint}
             </p>
             
             <div className="flex justify-end items-center mt-3 pt-3 border-t border-white/[0.04]">
               <Button size="sm" className="h-8 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-none w-full">Begin Triage Assessment</Button>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
