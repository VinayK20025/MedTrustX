'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CounseledPatient } from '../types/patientCounselor.types';
import { Users, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: CounseledPatient[]; }

export function CounselorPatientList({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/15"><Users className="w-4 h-4 text-rose-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Patient Schedule</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {patients.map(p => (
            <div key={p.id} className={cn("p-5 transition-colors cursor-pointer", p.status === 'In Session' ? "bg-rose-500/5 border-l-2 border-rose-500" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {p.patientName}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1">{p.diagnosis}</p>
                </div>
                <div className="text-right">
                   <span className="text-[10px] text-gray-500 font-mono block mb-1">{p.mrn}</span>
                   <span className="text-[10px] text-gray-400">Dr. {p.physician}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                     p.status === 'Waiting' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 
                     p.status === 'Decision Pending' ? 'text-warning-400 border-warning-500/30 bg-warning-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                )}>{p.status}</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                  <Clock className="w-3 h-3" /> Appt: {new Date(p.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
