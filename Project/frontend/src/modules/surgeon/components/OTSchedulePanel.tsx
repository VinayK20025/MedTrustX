'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OTScheduleEntry } from '../types/surgeon.types';
import { Calendar } from 'lucide-react';

interface Props { schedule: OTScheduleEntry[]; }

const statusStyle: Record<string, string> = {
  pending: 'border-l-indigo-500',
  in_progress: 'border-l-warning bg-warning/5 animate-pulse',
  completed: 'border-l-success opacity-70',
  delayed: 'border-l-emergency',
};

export function OTSchedulePanel({ schedule }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">OT Schedule</h3>
          <p className="text-xs text-gray-400 mt-0.5">Today's lineup</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px]">
        {schedule.map(s => (
          <div key={s.id} className={`p-3 bg-white/[0.02] border-y border-r border-white/[0.04] rounded-r-lg border-l-4 ${statusStyle[s.status]}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-black font-mono text-white">{s.time}</span>
              <span className="text-[10px] text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded font-mono font-bold">{s.room}</span>
            </div>
            <p className="text-xs font-semibold text-white">{s.patientName}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 mb-2 truncate">{s.procedure}</p>
            <div className="flex gap-3 text-[9px] text-gray-500 border-t border-white/[0.04] pt-2">
              <span>Anes: <span className="text-gray-300">{s.anesthesiologist}</span></span>
              <span>Scrub: <span className="text-gray-300">{s.scrubNurse}</span></span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
