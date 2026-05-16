'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { EhrPatient, PatientStatus } from '../types/ehr.types';
import { UserSquare, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: EhrPatient[]; selectedId?: string; onSelect: (id: string) => void; }

const statusColor: Record<PatientStatus, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'Pending Review': 'bg-warning/20 text-warning-light border border-warning/30 animate-pulse',
  Discharged: 'bg-gray-500/20 text-gray-400',
};

export function EhrPatientPanel({ patients, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><UserSquare className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[14px] font-bold text-white tracking-wide">Patient Registry</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-3 border-b border-white/[0.04]">
           <input type="text" placeholder="Search by Name or UHID..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-blue-500/50" />
        </div>
        <div className="divide-y divide-white/[0.03]">
          {patients.map(pat => (
            <div key={pat.id} onClick={() => onSelect(pat.id)}
              className={cn("p-4 cursor-pointer transition-all border-l-4 relative group",
                selectedId === pat.id ? "bg-white/[0.08] border-l-white/50" :
                "border-l-transparent hover:bg-white/[0.02]"
              )}>
              <div className="flex justify-between items-start mb-2">
                <div className="pr-2">
                  <span className="text-[9px] text-blue-300 font-mono block mb-0.5">{pat.uhid} • {pat.department}</span>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                    {pat.name} <span className="text-[10px] text-gray-500 font-normal">({pat.age}{pat.gender})</span>
                  </h4>
                </div>
                <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded tracking-wider', statusColor[pat.status])}>{pat.status}</span>
              </div>
              
              {pat.hasDuplicates && (
                <div className="mt-2 text-[10px] text-emergency-light font-bold bg-emergency/10 px-2 py-1 rounded inline-flex items-center gap-1.5">
                   <Users className="w-3 h-3" /> Duplicate Record Warning
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
