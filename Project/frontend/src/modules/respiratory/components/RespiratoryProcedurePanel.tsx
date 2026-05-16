'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RespiratoryProcedure } from '../types/respiratory.types';
import { useCompleteProcedure } from '../hooks/useRespiratoryAnalytics';
import { Stethoscope, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { procedures: RespiratoryProcedure[]; }

export function RespiratoryProcedurePanel({ procedures }: Props) {
  const { mutate: complete, isPending } = useCompleteProcedure();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Stethoscope className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Airway Procedures</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {procedures.map(proc => (
            <div key={proc.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{proc.name}</h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">{proc.patientId}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  proc.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                  proc.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-success/20 text-success-light'
                )}>
                  {proc.status}
                </span>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <p className="text-[11px] text-gray-400 italic">"{proc.notes}"</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(proc.scheduledTime).toLocaleTimeString()}
                </span>
                {proc.status !== 'Completed' && (
                  <Button size="xs" onClick={() => complete({ procedureId: proc.id, notes: 'Procedure completed without complications.' })} disabled={isPending} className="h-6 text-[10px] bg-orange-600 hover:bg-orange-500 border-none font-bold" leftIcon={<CheckCircle2 className="w-3 h-3" />}>
                    Mark Complete
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
