'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ERTriagePatient } from '../types/er.types';
import { Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { queue: ERTriagePatient[]; }

export function ERTriageQueue({ queue }: Props) {
  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Triage Queue</h3>
        </div>
        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded font-bold">
          {queue.length} WAITING
        </span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto">
        {queue.map(p => (
          <div key={p.id} className={`p-4 rounded-xl border relative overflow-hidden transition-all group ${
            p.triageLevel === 'critical' ? 'border-emergency/40 bg-emergency/5' :
            p.triageLevel === 'urgent' ? 'border-warning/30 bg-warning/5' :
            'border-white/[0.06] bg-surface-dark'
          }`}>
             {p.triageLevel === 'critical' && <div className="absolute left-0 top-0 w-1 h-full bg-emergency animate-pulse" />}
             {p.triageLevel === 'urgent' && <div className="absolute left-0 top-0 w-1 h-full bg-warning" />}
             {p.triageLevel === 'stable' && <div className="absolute left-0 top-0 w-1 h-full bg-success" />}
             
             <div className="flex justify-between items-start mb-2 pl-2">
               <div>
                 <span className="text-sm font-bold text-white block leading-tight">{p.name}</span>
                 <span className="text-xs text-gray-400 mt-1 block">{p.symptoms}</span>
               </div>
               <div className="text-right">
                 <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${
                   p.triageLevel === 'critical' ? 'bg-emergency/20 text-emergency-light animate-pulse' :
                   p.triageLevel === 'urgent' ? 'bg-warning/20 text-warning-light' :
                   'bg-success/20 text-success-light'
                 }`}>
                   {p.triageLevel}
                 </span>
                 <span className="block text-[10px] text-gray-500 mt-1 font-mono">
                   WAIT: {p.waitTimeMins}m
                 </span>
               </div>
             </div>
             
             <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.04] pl-2">
               <span className="text-[10px] text-gray-500 font-mono">Arr: {p.arrivalTime}</span>
               <div className="flex gap-2">
                 <Button size="sm" variant="outline" className="h-7 px-3 text-xs border-white/10 hover:bg-white/5">Details</Button>
                 <Button size="sm" className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 border-none">Assign</Button>
               </div>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
