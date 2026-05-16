'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PathologistCase } from '../types/pathologist.types';
import { Microscope, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: PathologistCase[]; }

export function PathologistCasePanel({ cases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Microscope className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Pending Review Queue</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => (
            <div key={c.id} className={cn("p-5 transition-colors cursor-pointer", c.priority === 'STAT' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {c.patientName}
                    {c.priority === 'STAT' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 font-mono">{c.patientId} | {c.testType}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  c.priority === 'STAT' ? 'bg-emergency/20 text-emergency-light' : 
                  c.priority === 'Urgent' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                )}>
                  {c.priority}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <span className="text-[10px] uppercase font-bold text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5">{c.status}</span>
                <span className="flex items-center gap-1 text-[9px] text-gray-500 font-mono"><Clock className="w-3 h-3" /> Received: {new Date(c.receivedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
