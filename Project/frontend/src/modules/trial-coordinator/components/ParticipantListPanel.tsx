'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TrialParticipant } from '../types/trial-coordinator.types';
import { Users, AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { participants: TrialParticipant[]; selectedId?: string; onSelect: (id: string) => void; }

const statusColor: Record<string, string> = { Active: 'border-emerald-500 bg-emerald-500/[0.04]', Screening: 'border-blue-500 bg-blue-500/[0.04]', Completed: 'border-gray-500 bg-gray-500/[0.04]', Withdrawn: 'border-emergency bg-emergency/[0.04]' };

export function ParticipantListPanel({ participants, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" /> Participants
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{participants.length} Subjects</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {participants.map(p => (
            <div key={p.id} onClick={() => onSelect(p.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusColor[p.status],
                selectedId === p.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{p.subjectId}</span>
                {p.hasDeviation && (
                  <span className="text-[9px] font-bold bg-emergency/15 text-emergency-light px-1.5 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Deviation
                  </span>
                )}
              </div>
              
              <h4 className="text-[14px] font-bold text-white mb-2">{p.name}</h4>

              {/* Visit Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Visit Progress</span>
                  <span className="text-gray-300 font-mono">{p.visitNumber}/{p.totalVisits}</span>
                </div>
                <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(p.visitNumber / p.totalVisits) * 100}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                 {p.status !== 'Completed' ? (
                   <span className="text-gray-400 flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {new Date(p.nextVisit).toLocaleDateString()}</span>
                 ) : (
                   <span className="text-success-light flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Complete</span>
                 )}
                 <span className={cn('font-bold uppercase tracking-wider',
                   p.status === 'Active' ? 'text-emerald-400' : p.status === 'Screening' ? 'text-blue-400' : 'text-gray-400'
                 )}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
