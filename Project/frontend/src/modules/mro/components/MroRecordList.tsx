'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PatientRecord } from '../types/mro.types';
import { FileText, AlertTriangle, CalendarDays } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { records: PatientRecord[]; }

export function MroRecordList({ records }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><FileText className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Record Queue</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {records.map(r => (
            <div key={r.id} className={cn("p-5 transition-colors cursor-pointer", r.status === 'Incomplete' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {r.patientName}
                    {r.status === 'Incomplete' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-mono">
                    {r.mrn} <span>•</span> {r.id}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    r.encounterType === 'ER' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                  )}>
                    {r.encounterType}
                  </span>
                  <span className={cn("text-[10px] font-mono", r.completionPercentage < 100 ? "text-warning-light" : "text-success-light")}>
                    {r.completionPercentage}% Complete
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-2">
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                     r.status === 'Incomplete' ? 'text-emergency-400 border-emergency-500/30 bg-emergency-500/10' : 
                     r.status === 'Pending Coding' ? 'text-warning-400 border-warning-500/30 bg-warning-500/10' : 'text-success-400 border-success-500/30 bg-success-500/10'
                  )}>{r.status}</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                  <CalendarDays className="w-3 h-3" /> Discharged: {new Date(r.dischargeDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
