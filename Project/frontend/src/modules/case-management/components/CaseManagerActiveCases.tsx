'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ActiveCase } from '../types/caseManager.types';
import { BriefcaseMedical, AlertTriangle, CalendarDays } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: ActiveCase[]; }

export function CaseManagerActiveCases({ cases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/15"><BriefcaseMedical className="w-4 h-4 text-sky-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Active Caseload</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => {
            const isOverstay = c.currentLOS > c.expectedLOS;
            return (
              <div key={c.id} className={cn("p-5 transition-colors cursor-pointer", isOverstay ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                      {c.patientName}
                      {isOverstay && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-mono">
                      {c.mrn} <span>•</span> {c.id}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded font-mono', 
                      isOverstay ? 'bg-emergency/20 text-emergency-light' : 'bg-white/10 text-gray-300'
                    )}>
                      LOS: {c.currentLOS} / {c.expectedLOS}d
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">${c.caseCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                  <div className="flex gap-2">
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                       c.dischargeStatus === 'Ready' ? 'text-success-400 border-success-500/30 bg-success-500/10' : 
                       c.dischargeStatus === 'Delayed' ? 'text-emergency-400 border-emergency-500/30 bg-emergency-500/10' : 'text-sky-400 border-sky-500/30 bg-sky-500/10'
                    )}>{c.dischargeStatus}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                    <CalendarDays className="w-3 h-3" /> Admitted: {new Date(c.admissionDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
