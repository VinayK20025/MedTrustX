'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DoctorSchedule, TimeSlot } from '../types/admissionScheduler.types';
import { useBookSlot } from '../hooks/useAdmissionSchedulerAnalytics';
import { Calendar, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { schedules: DoctorSchedule[]; }

const slotStyles: Record<TimeSlot['status'], { bg: string; text: string; ring: string }> = {
  Available: { bg: 'bg-success/15 hover:bg-success/25', text: 'text-success-light', ring: 'border-success/30' },
  Booked:    { bg: 'bg-emergency/10', text: 'text-emergency-light', ring: 'border-emergency/20' },
  Tentative: { bg: 'bg-warning/10 hover:bg-warning/20', text: 'text-warning-light', ring: 'border-warning/25' },
  Blocked:   { bg: 'bg-gray-500/10', text: 'text-gray-500', ring: 'border-gray-500/20' },
};

export function SchedulerCalendarView({ schedules }: Props) {
  const { mutate: book } = useBookSlot();

  return (
    <Card className="border-blue-500/25 shadow-glass bg-[#040814] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Calendar className="w-4 h-4 text-blue-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Doctor Calendar</h3>
            <span className="text-[10px] text-gray-500 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-success-light"><span className="w-2 h-2 rounded-full bg-success-500" /> Available</span>
          <span className="flex items-center gap-1 text-emergency-light"><span className="w-2 h-2 rounded-full bg-emergency-500" /> Booked</span>
          <span className="flex items-center gap-1 text-warning-light"><span className="w-2 h-2 rounded-full bg-warning-500" /> Tentative</span>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {schedules.map(doc => {
          const openSlots = doc.slots.filter(s => s.status === 'Available').length;
          return (
            <div key={doc.doctorId} className="border-b border-white/[0.03]">
              <div className="px-5 py-3 bg-black/30 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{doc.doctorName}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">{doc.department}</span>
                </div>
                <span className="text-[10px] text-success-light font-mono font-bold">{openSlots} open</span>
              </div>
              <div className="px-5 py-3 grid grid-cols-6 gap-2">
                {doc.slots.map(slot => {
                  const s = slotStyles[slot.status];
                  return (
                    <div
                      key={slot.id}
                      onClick={() => slot.status === 'Available' && book({ slotId: slot.id, patientMrn: '' })}
                      className={cn('px-2 py-2 rounded-lg border text-center transition-all relative group', s.bg, s.ring, slot.status === 'Available' ? 'cursor-pointer' : 'cursor-default')}
                    >
                      <span className={cn('text-[11px] font-mono font-bold block', s.text)}>{slot.time}</span>
                      {slot.patientName && <span className="text-[8px] text-gray-400 block truncate mt-0.5">{slot.patientName}</span>}
                      {slot.status === 'Available' && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
