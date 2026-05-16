'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DischargePatient } from '../types/discharge.types';
import { useEscalateDelay } from '../hooks/useDischargeAnalytics';
import { Users, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: DischargePatient[]; selectedId?: string; onSelect: (id: string) => void; }

export function DischargePatientList({ patients, selectedId, onSelect }: Props) {
  const { mutate: escalate } = useEscalateDelay();
  const statusColor: Record<DischargePatient['status'], string> = {
    Pending: 'bg-gray-500/20 text-gray-300',
    'In Progress': 'bg-blue-500/20 text-blue-300',
    Ready: 'bg-success/20 text-success-light',
    Completed: 'bg-success/10 text-success-light',
    Delayed: 'bg-emergency/20 text-emergency-light animate-pulse',
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
        <div className="p-1.5 rounded bg-orange-500/15"><Users className="w-3.5 h-3.5 text-orange-400" /></div>
        <h3 className="text-[13px] font-bold text-white tracking-wide">Discharge Queue</h3>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {patients.map(p => (
            <div key={p.id} onClick={() => onSelect(p.id)} className={cn("p-4 cursor-pointer transition-all border-l-2",
              selectedId === p.id ? "bg-blue-500/[0.06] border-l-blue-500" :
              p.status === 'Delayed' ? "bg-emergency/[0.03] border-l-emergency" : "border-l-transparent hover:bg-white/[0.015]"
            )}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                    {p.patientName}
                    {p.status === 'Delayed' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light" />}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.ward} • Bed {p.bed}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', statusColor[p.status])}>{p.status}</span>
              </div>
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-white font-mono">{p.overallProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-700", p.overallProgress >= 80 ? "bg-success-500" : p.overallProgress >= 50 ? "bg-blue-500" : "bg-warning-500")} style={{ width: `${p.overallProgress}%` }} />
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.attendingDoctor}</span>
                {p.status === 'Delayed' && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); escalate(p.id); }} className="h-6 text-[9px] bg-emergency/10 text-emergency-light border border-emergency/30 hover:bg-emergency/20" leftIcon={<ArrowUpRight className="w-3 h-3" />}>
                    Escalate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
