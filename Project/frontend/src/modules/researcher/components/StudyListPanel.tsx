'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ClinicalStudy } from '../types/researcher.types';
import { FlaskConical, AlertTriangle, Pause } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { studies: ClinicalStudy[]; selectedId?: string; onSelect: (id: string) => void; }

const phaseColor: Record<string, string> = { 'Phase 1': 'text-cyan-300 bg-cyan-500/15', 'Phase 2': 'text-blue-300 bg-blue-500/15', 'Phase 3': 'text-purple-300 bg-purple-500/15', 'Phase 4': 'text-emerald-300 bg-emerald-500/15' };
const statusBorder: Record<string, string> = { Active: 'border-emerald-500 bg-emerald-500/[0.04]', Paused: 'border-warning bg-warning/[0.04]', Design: 'border-blue-500 bg-blue-500/[0.04]', Completed: 'border-gray-500 bg-gray-500/[0.04]' };

export function StudyListPanel({ studies, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" /> Clinical Trials
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{studies.length} Studies</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {studies.map(s => (
            <div key={s.id} onClick={() => onSelect(s.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusBorder[s.status],
                selectedId === s.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{s.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider', phaseColor[s.phase])}>{s.phase}</span>
              </div>
              
              <h4 className="text-[13px] font-bold text-white mb-2 leading-snug">{s.title}</h4>

              {/* Enrollment Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Enrollment</span>
                  <span className="text-gray-300 font-mono">{s.currentEnrollment}/{s.targetEnrollment}</span>
                </div>
                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${s.progress}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                 {s.adverseEvents > 0 ? (
                   <span className="text-emergency-light flex items-center gap-1 font-bold"><AlertTriangle className="w-3 h-3" /> {s.adverseEvents} AE</span>
                 ) : (
                   <span className="text-gray-500">No AE</span>
                 )}
                 <span className={cn('font-bold uppercase tracking-wider flex items-center gap-1',
                   s.status === 'Active' ? 'text-emerald-400' : s.status === 'Paused' ? 'text-warning-light' : 'text-gray-400'
                 )}>
                   {s.status === 'Paused' && <Pause className="w-3 h-3" />}
                   {s.status}
                 </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
