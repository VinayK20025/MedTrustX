'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TrainingSession, TrainingProgram } from '../types/training.types';
import { CalendarDays, MapPin, Users, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { sessions: TrainingSession[]; programs: TrainingProgram[]; }

const sessionStatusStyle: Record<TrainingSession['status'], { bg: string; text: string }> = {
  Upcoming: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-300' },
  'In Progress': { bg: 'bg-success/10 border-success/20', text: 'text-success-light' },
  Completed: { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400' },
};

export function TrainingSchedulePanel({ sessions, programs }: Props) {
  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Upcoming Sessions */}
      <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1 flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-blue-400">UPCOMING SESSIONS</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {sessions.map(s => {
              const st = sessionStatusStyle[s.status];
              return (
                <div key={s.id} className="p-4 hover:bg-white/[0.015] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[13px] font-bold text-white">{s.programName}</h4>
                    <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider border flex items-center gap-1', st.bg, st.text)}>
                      {s.status === 'In Progress' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {s.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                      {s.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time} • {new Date(s.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.enrolled}/{s.capacity} enrolled</span>
                    <span>{s.trainer}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Active Programs */}
      <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1 flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <h3 className="text-[12px] font-bold tracking-widest text-gray-400">ACTIVE PROGRAMS</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {programs.filter(p => p.status === 'Active').map(p => {
              const pct = Math.round((p.completedCount / p.enrolledCount) * 100);
              return (
                <div key={p.id} className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[12px] font-bold text-white">{p.name}</h4>
                    <span className="text-[9px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded font-bold">{p.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={cn("h-full", pct >= 80 ? "bg-success-500" : pct >= 50 ? "bg-blue-500" : "bg-warning-500")} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 w-16 text-right">{p.completedCount}/{p.enrolledCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
