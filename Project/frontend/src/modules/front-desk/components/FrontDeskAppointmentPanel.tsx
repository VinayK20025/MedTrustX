'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AppointmentSlot } from '../types/frontDesk.types';
import { useBookAppointment } from '../hooks/useFrontDeskAnalytics';
import { CalendarDays, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { appointments: AppointmentSlot[]; }

export function FrontDeskAppointmentPanel({ appointments }: Props) {
  const { mutate: book, isPending } = useBookAppointment();

  // Group by doctor
  const byDoctor = appointments.reduce<Record<string, AppointmentSlot[]>>((acc, apt) => {
    const key = apt.doctorName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {});

  const slotColor: Record<AppointmentSlot['status'], string> = {
    Available: 'bg-success/15 border-success/30 text-success-light hover:bg-success/25 cursor-pointer',
    Booked: 'bg-emergency/10 border-emergency/20 text-emergency-light opacity-70',
    Blocked: 'bg-gray-500/10 border-gray-500/20 text-gray-500 opacity-50',
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><CalendarDays className="w-4 h-4 text-blue-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Today's Slots</h3>
            <span className="text-[10px] text-gray-500 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {Object.entries(byDoctor).map(([doctor, slots]) => (
          <div key={doctor} className="border-b border-white/[0.03]">
            <div className="px-5 py-3 bg-black/20 flex justify-between items-center">
              <div>
                <h4 className="text-[12px] font-bold text-white">{doctor}</h4>
                <span className="text-[10px] text-gray-500 font-mono">{slots[0]?.department}</span>
              </div>
              <span className="text-[10px] text-success-light font-mono">{slots.filter(s => s.status === 'Available').length} open</span>
            </div>
            <div className="px-5 py-3 flex flex-wrap gap-2">
              {slots.map(slot => (
                <div
                  key={slot.id}
                  onClick={() => slot.status === 'Available' && book({ slotId: slot.id, patientMrn: '' })}
                  className={cn('px-3 py-2 rounded-lg border text-[11px] font-mono font-bold transition-all relative group', slotColor[slot.status])}
                >
                  {slot.time}
                  {slot.status === 'Booked' && <span className="block text-[9px] font-normal mt-0.5">{slot.patientName}</span>}
                  {slot.status === 'Available' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
