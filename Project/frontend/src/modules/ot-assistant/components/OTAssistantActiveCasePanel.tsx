'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OTCascadingCase } from '../types/otAssistant.types';
import { Activity, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeCase?: OTCascadingCase; upcomingCases: OTCascadingCase[]; }

export function OTAssistantActiveCasePanel({ activeCase, upcomingCases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-dark h-full flex flex-col relative overflow-hidden">
      {activeCase && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse" />}
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between bg-surface-light">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Activity className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Active OT Assignment</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto">
        {activeCase ? (
          <div className="mb-6">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-2">Currently In Progress</h4>
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h2 className="text-lg font-bold text-white">{activeCase.procedure}</h2>
                   <p className="text-[12px] text-blue-300 mt-1">{activeCase.surgeon} | {activeCase.otRoom}</p>
                 </div>
                 <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
               </div>
               <div className="mt-4 border-t border-blue-500/20 pt-3">
                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Required Trays</p>
                 <div className="flex gap-2 flex-wrap">
                   {activeCase.instrumentTraysNeeded.map(tray => (
                     <span key={tray} className="bg-surface-dark text-gray-300 text-[11px] px-2 py-1 rounded border border-white/5">{tray}</span>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="p-4 mb-6 text-center text-[12px] text-gray-500 border border-white/5 rounded-xl">No active surgery currently.</div>
        )}

        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-2">On Deck</h4>
          <div className="space-y-2">
            {upcomingCases.map(uc => (
               <div key={uc.id} className="p-3 bg-surface-light border border-white/5 rounded-lg flex justify-between items-center">
                 <div>
                   <p className="text-[12px] font-bold text-white">{uc.procedure}</p>
                   <p className="text-[10px] text-gray-500 mt-0.5">{uc.otRoom} | {uc.surgeon}</p>
                 </div>
                 <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded"><Clock className="w-3 h-3"/> {uc.scheduledTime}</span>
               </div>
            ))}
            {upcomingCases.length === 0 && <p className="text-[11px] text-gray-500 italic">No upcoming cases scheduled.</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
