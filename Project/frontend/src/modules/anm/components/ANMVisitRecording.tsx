'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ANMVisit } from '../types/anm.types';
import { FileText, WifiOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { 
  recentVisits: ANMVisit[];
}

export function ANMVisitRecording({ recentVisits }: Props) {
  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/10 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Recent Visits (Offline Sync)</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
         
         <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg mb-2 shadow-lg shadow-indigo-500/20">
           + Start New Visit Form
         </Button>

         <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-2">Saved Records</h4>
         
         <div className="space-y-3">
            {recentVisits.map(v => (
              <div key={v.id} className="p-3 rounded-xl border border-white/[0.06] bg-surface-dark flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-white">{v.patientName}</span>
                   {v.synced ? (
                     <div className="flex items-center gap-1 text-[10px] text-success-light bg-success/10 px-2 py-0.5 rounded border border-success/20">
                       <CheckCircle2 className="w-3 h-3" /> SYNCED
                     </div>
                   ) : (
                     <div className="flex items-center gap-1 text-[10px] text-warning-light bg-warning/10 px-2 py-0.5 rounded border border-warning/20">
                       <WifiOff className="w-3 h-3" /> OFFLINE
                     </div>
                   )}
                 </div>
                 <span className="text-[11px] text-gray-400 uppercase tracking-widest">{v.type.replace('_', ' ')} • {v.date}</span>
                 <p className="text-xs text-gray-300 mt-1">{v.notes}</p>
              </div>
            ))}
         </div>
      </CardBody>
    </Card>
  );
}
