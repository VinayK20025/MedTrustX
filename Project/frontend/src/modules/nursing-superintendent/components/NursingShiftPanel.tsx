'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ShiftSchedule } from '../types/nursing.types';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { schedules: ShiftSchedule[]; }

export function NursingShiftPanel({ schedules }: Props) {
  return (
    <Card className="border-teal-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-teal-500/20 px-5 py-4 flex items-center justify-between bg-teal-500/5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Shift Scheduling</h3>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[10px] border-teal-500/30 text-teal-300 hover:bg-teal-500/10">Manage Schedule</Button>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {schedules.map(s => (
          <div key={s.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark/50 flex flex-col gap-2">
             <div className="flex justify-between items-start">
                <div>
                   <span className="text-xs font-bold text-white block">{s.nurseName}</span>
                   <span className="text-[10px] text-gray-400">Ward: {s.wardId}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3"/> {s.shiftType}
                </span>
             </div>
             <div className="flex justify-end">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Status: {s.status}</span>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
