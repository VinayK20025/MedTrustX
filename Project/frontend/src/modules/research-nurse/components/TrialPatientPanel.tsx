'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TrialPatient } from '../types/research-nurse.types';
import { Users, AlertTriangle, Clock, Pill } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: TrialPatient[]; selectedId?: string; onSelect: (id: string) => void; }

const statusColor: Record<string, string> = { Active: 'border-emerald-500 bg-emerald-500/[0.04]', Screening: 'border-blue-500 bg-blue-500/[0.04]', 'Follow-Up': 'border-purple-500 bg-purple-500/[0.04]', Completed: 'border-gray-500 bg-gray-500/[0.04]' };

export function TrialPatientPanel({ patients, selectedId, onSelect }: Props) {
  const todayPatients = patients.filter(p => p.visitToday);
  const otherPatients = patients.filter(p => !p.visitToday);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-400" /> Trial Patients
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{todayPatients.length} Today</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {todayPatients.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Scheduled Today</span>
          </div>
        )}
        <div className="divide-y divide-white/[0.03]">
          {todayPatients.map(p => (
            <div key={p.id} onClick={() => onSelect(p.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusColor[p.status],
                selectedId === p.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{p.subjectId}</span>
                {p.hasAdverseEvent && (
                  <span className="text-[9px] font-bold bg-emergency/15 text-emergency-light px-1.5 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> AE
                  </span>
                )}
              </div>
              <h4 className="text-[14px] font-bold text-white mb-1">{p.name}</h4>
              {p.nextDrugDue && (
                <div className="flex items-center gap-1.5 text-[10px] text-orange-300 font-bold mt-1 bg-orange-500/10 px-2 py-1 rounded inline-flex">
                  <Pill className="w-3 h-3" /> Drug due: {new Date(p.nextDrugDue).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </div>
              )}
              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                <span className={cn('font-bold uppercase tracking-wider',
                  p.status === 'Active' ? 'text-emerald-400' : 'text-gray-400'
                )}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>

        {otherPatients.length > 0 && (
          <>
            <div className="px-3 pt-3 pb-1 border-t border-white/5">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Other Subjects</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {otherPatients.map(p => (
                <div key={p.id} onClick={() => onSelect(p.id)}
                  className={cn('p-3 cursor-pointer transition-all border-l-4 opacity-60 hover:opacity-100',
                    statusColor[p.status],
                    selectedId === p.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06] opacity-100' : 'hover:bg-white/[0.06]'
                  )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400">{p.subjectId}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{p.status}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-gray-300 mt-1">{p.name}</h4>
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
