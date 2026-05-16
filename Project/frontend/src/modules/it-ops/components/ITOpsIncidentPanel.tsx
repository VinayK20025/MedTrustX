'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ITOpsIncident } from '../types/itOps.types';
import { GitPullRequest } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { incidents: ITOpsIncident[]; }

export function ITOpsIncidentPanel({ incidents }: Props) {
  if (incidents.length === 0) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center p-6 text-center">
         <GitPullRequest className="w-10 h-10 text-gray-500 mb-3" />
         <h3 className="text-white font-bold">No Escalated Incidents</h3>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-warning/20 px-5 py-4 flex items-center justify-between bg-warning/5">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-warning-light" />
          <h3 className="text-[15px] font-bold text-warning-light tracking-wide">Incident Coordination</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto">
        {incidents.map(inc => (
          <div key={inc.id} className="p-4 rounded-xl border border-warning/30 bg-warning/10 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                 <span className="text-sm font-bold text-white block">{inc.id}: {inc.title}</span>
                 <span className="text-[12px] text-gray-300 mt-1 block">Assigned To: <span className="font-bold">{inc.assignedTeam}</span></span>
               </div>
               <div className="text-right">
                 <span className="text-[10px] text-gray-400 font-mono block mb-1">Open: {inc.timeOpen}</span>
                 <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest ${
                   inc.severity === 'critical' || inc.severity === 'high' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                 }`}>
                   {inc.severity}
                 </span>
               </div>
             </div>
             
             <div className="flex justify-between items-center mt-2 pt-3 border-t border-warning/20">
               <span className="text-[11px] text-gray-400 uppercase tracking-widest">{inc.status}</span>
               <div className="flex gap-2">
                 <Button size="sm" variant="outline" className="h-8 border-warning/30 text-warning-light hover:bg-warning/20">View War Room</Button>
                 <Button size="sm" className="h-8 bg-warning hover:bg-warning-light border-none text-black font-bold">Escalate</Button>
               </div>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
