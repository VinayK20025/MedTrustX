'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RespiratoryTherapy } from '../types/respiratory.types';
import { useRecordTherapy } from '../hooks/useRespiratoryAnalytics';
import { Syringe, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { therapies: RespiratoryTherapy[]; }

export function RespiratoryTherapyPanel({ therapies }: Props) {
  const { mutate: record, isPending } = useRecordTherapy();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/15"><Syringe className="w-4 h-4 text-purple-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Therapy Administration</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {therapies.map(ther => (
            <div key={ther.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{ther.type}</h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">{ther.patientId}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  ther.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' :
                  ther.status === 'In Progress' ? 'bg-purple-500/20 text-purple-400' : 'bg-success/20 text-success-light'
                )}>
                  {ther.status}
                </span>
              </div>
              
              {ther.medication && (
                <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                  <p className="text-[11px] font-bold text-purple-300">Medication: {ther.medication}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Frequency: {ther.frequency}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Admin: {new Date(ther.lastAdministered).toLocaleTimeString()}
                </span>
                {ther.status === 'Scheduled' && (
                  <Button size="xs" onClick={() => record(ther.id)} disabled={isPending} className="h-6 text-[10px] bg-purple-600 hover:bg-purple-500 border-none font-bold" leftIcon={<CheckCircle2 className="w-3 h-3" />}>
                    Record Admin
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
