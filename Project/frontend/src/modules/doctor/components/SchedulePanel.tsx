'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Appointment } from '../types/doctor.types';
import { Calendar } from 'lucide-react';

interface Props { appointments: Appointment[]; }

const statusStyle: Record<string, string> = {
  scheduled:   'bg-indigo-500/20 text-indigo-300',
  in_progress: 'bg-warning/20 text-warning-light',
  completed:   'bg-success/20 text-success-light',
  no_show:     'bg-emergency/20 text-emergency-light',
};
const typeLabel: Record<string, string> = { opd: 'OPD', follow_up: 'F/U', round: 'Round' };

export function SchedulePanel({ appointments }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Today's Schedule</h3>
          <p className="text-xs text-gray-400 mt-0.5">{appointments.length} appointments</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2">
        {appointments.map(a => (
          <div key={a.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center justify-between hover:border-white/[0.08] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black font-mono text-white w-12">{a.time}</span>
              <div>
                <span className="text-xs font-semibold text-white">{a.patientName}</span>
                <span className="text-[10px] text-gray-500 ml-2">{typeLabel[a.type]}</span>
              </div>
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${statusStyle[a.status]}`}>{a.status.replace('_', ' ')}</span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
