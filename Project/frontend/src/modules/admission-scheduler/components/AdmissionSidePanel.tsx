'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WaitlistEntry, ActiveAdmission } from '../types/admissionScheduler.types';
import { Clock, ListOrdered, BedDouble, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { waitlist: WaitlistEntry[]; admissions: ActiveAdmission[]; }

export function AdmissionSidePanel({ waitlist, admissions }: Props) {
  return (
    <div className="flex flex-col gap-5 h-full">
      <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1 flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-amber-400">WAITLIST ({waitlist.length})</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {waitlist.map(w => (
              <div key={w.id} className="p-3 hover:bg-white/[0.015]">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[12px] font-bold text-white">{w.patientName}</h4>
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', w.priority === 'Urgent' ? 'bg-emergency/20 text-emergency-light' : 'bg-gray-500/20 text-gray-300')}>{w.priority}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                  <span>{w.preferredDoctor}</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{w.preferredTime}</span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1 flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <BedDouble className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-blue-400">ACTIVE ({admissions.length})</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {admissions.map(adm => (
              <div key={adm.id} className={cn("p-3", adm.status === 'Discharge Planned' && "border-l-2 border-l-warning")}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[12px] font-bold text-white flex items-center gap-1">{adm.patientName}{adm.status === 'Discharge Planned' && <AlertTriangle className="w-3 h-3 text-warning-light" />}</h4>
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', adm.status === 'Active' ? 'bg-success/20 text-success-light' : 'bg-warning/20 text-warning-light')}>{adm.status}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">{adm.department} • Bed {adm.bed}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
