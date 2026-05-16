'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TriagePatient } from '../types/er.types';
import { Users, Clock } from 'lucide-react';

interface Props { queue: TriagePatient[]; }

const priorityStyle: Record<string, string> = {
  critical: 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse',
  urgent: 'bg-warning/20 text-warning-light border border-warning/30',
  stable: 'bg-success/10 text-success-light border border-success/20',
};

export function TriageQueue({ queue }: Props) {
  const sorted = [...queue].sort((a, b) => {
    const pVal = { critical: 3, urgent: 2, stable: 1 };
    if (pVal[a.priority] !== pVal[b.priority]) return pVal[b.priority] - pVal[a.priority];
    return b.waitingTime - a.waitingTime;
  });

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Triage Queue</h3>
          <p className="text-xs text-gray-400 mt-0.5">{queue.length} incoming</p>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.04]">
          {sorted.map(q => (
            <div key={q.id} className="p-4 transition-colors hover:bg-white/[0.02] cursor-pointer">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{q.patientName}</span>
                  <span className="text-[10px] text-gray-500">{q.age}{q.gender}</span>
                </div>
                <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${priorityStyle[q.priority]}`}>
                  {q.priority}
                </span>
              </div>
              <p className="text-xs text-gray-300 truncate mb-2">{q.symptoms}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <Clock className="w-3 h-3" />
                <span className={q.waitingTime >= 15 && q.priority !== 'stable' ? 'text-emergency-light font-bold' : ''}>Wait: {q.waitingTime}m</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
