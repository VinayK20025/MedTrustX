'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICNOutbreak } from '../types/icn.types';
import { Activity, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { outbreaks: ICNOutbreak[]; }

export function ICNOutbreakInvestigation({ outbreaks }: Props) {
  if (outbreaks.length === 0) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
         <p className="text-gray-400">No active outbreaks detected.</p>
      </Card>
    );
  }

  return (
    <Card className="border-emergency/40 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-emergency/20 px-5 py-4 flex items-center justify-between bg-emergency/5">
        <div className="flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-emergency-light" />
          <h3 className="text-[15px] font-bold text-emergency-light tracking-wide">Outbreak Clusters</h3>
        </div>
        <span className="text-xs bg-emergency text-white px-2 py-1 rounded font-bold animate-pulse">
          INVESTIGATION REQUIRED
        </span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-4 overflow-y-auto">
        {outbreaks.map(o => (
          <div key={o.id} className="p-4 rounded-xl border border-emergency/30 bg-emergency/10 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                 <span className="text-lg font-black text-emergency-light block">{o.infectionType}</span>
                 <span className="text-[12px] text-gray-300 mt-1 block">Location: {o.location}</span>
               </div>
               <div className="text-right">
                 <span className="text-3xl font-black text-white">{o.linkedCases}</span>
                 <span className="block text-[10px] text-gray-400 uppercase tracking-widest mt-1">Linked Cases</span>
               </div>
             </div>
             
             <div className="flex justify-between items-center mt-2 pt-3 border-t border-emergency/20">
               <span className="text-[11px] text-gray-400">First Case: {o.firstCaseDate}</span>
               <div className="flex gap-2">
                 <Button size="sm" variant="outline" className="border-emergency/30 text-emergency-light hover:bg-emergency/20">View Map</Button>
                 <Button size="sm" className="bg-emergency hover:bg-emergency-light border-none text-white">Open Investigation</Button>
               </div>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
