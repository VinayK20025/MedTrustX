'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ShiftSlot, DepartmentStaffing } from '../types/hr.types';
import { CalendarClock, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { shifts: ShiftSlot[]; deptStaffing: DepartmentStaffing[]; }

const shiftStatusStyle: Record<ShiftSlot['status'], { bg: string; text: string }> = {
  'Fully Staffed': { bg: 'bg-success/10 border-success/20', text: 'text-success-light' },
  Understaffed:    { bg: 'bg-warning/10 border-warning/20', text: 'text-warning-light' },
  Critical:        { bg: 'bg-emergency/10 border-emergency/20', text: 'text-emergency-light' },
};

export function HrShiftPanel({ shifts, deptStaffing }: Props) {
  return (
    <Card className="border-indigo-500/25 shadow-glass bg-[#040614] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><CalendarClock className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Shift & Staffing Overview</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        {/* Shift Grid */}
        <div className="p-5 border-b border-white/[0.03]">
          <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Today's Shift Coverage</h4>
          <div className="grid grid-cols-2 gap-3">
            {shifts.map(s => {
              const st = shiftStatusStyle[s.status];
              return (
                <div key={s.id} className={cn('p-3 rounded-xl border', st.bg)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="text-[12px] font-bold text-white">{s.department}</h5>
                      <span className="text-[10px] text-gray-500 font-mono">{s.shift} Shift</span>
                    </div>
                    {s.status === 'Critical' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                    {s.status === 'Fully Staffed' && <CheckCircle2 className="w-4 h-4 text-success-light" />}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className={cn("text-[18px] font-black font-mono", st.text)}>{s.assigned}</span>
                      <span className="text-[12px] text-gray-500 font-mono">/{s.required}</span>
                    </div>
                    <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', st.bg, st.text)}>{s.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Department Staffing */}
        <div className="p-5">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Department Levels</h4>
          <div className="space-y-3">
            {deptStaffing.map(d => (
              <div key={d.department} className="flex items-center gap-3">
                <span className="text-[12px] text-white font-bold w-24 shrink-0">{d.department}</span>
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all", d.status === 'Optimal' ? "bg-success-500" : d.status === 'Warning' ? "bg-warning-500" : "bg-emergency-500")} style={{ width: `${(d.onDuty / d.required) * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-gray-400 w-14 text-right">{d.onDuty}/{d.required}</span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
