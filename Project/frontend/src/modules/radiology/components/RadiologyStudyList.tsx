'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ImagingStudy } from '../types/radiology.types';
import { Layers, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { studies: ImagingStudy[]; }

export function RadiologyStudyList({ studies }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Layers className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Worklist (PACS)</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {studies.map(s => (
            <div key={s.id} className={cn("p-5 transition-colors cursor-pointer", s.priority === 'STAT' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {s.patientName}
                    {s.priority === 'STAT' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-mono">
                    {s.patientId} <span>•</span> {s.bodyPart}
                  </p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  s.priority === 'STAT' ? 'bg-emergency/20 text-emergency-light' : 'bg-blue-500/20 text-blue-400'
                )}>
                  {s.priority}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-300 bg-surface-dark px-2 py-1 rounded border border-white/10">{s.modality}</span>
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                     s.status === 'In Progress' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : 'text-gray-400 border-white/5'
                  )}>{s.status}</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                  <Clock className="w-3 h-3" /> {new Date(s.studyDate).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
