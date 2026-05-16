'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardPatient, ClinicalAlert } from '../types/nurse-ward.types';
import { Users, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: WardPatient[]; alerts: ClinicalAlert[]; selectedId?: string; onSelect: (id: string) => void; }

const statusColor = { Critical: 'border-emergency bg-emergency/[0.04]', Observation: 'border-warning-light bg-warning/[0.04]', Stable: 'border-blue-500 bg-blue-500/[0.04]' };

export function PatientListPanel({ patients, alerts, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" /> My Patients
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{patients.length} Assigned</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {patients.map(p => {
            const hasAlert = alerts.some(a => a.patientId === p.id);
            return (
              <div key={p.id} onClick={() => onSelect(p.id)}
                className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                  statusColor[p.status],
                  selectedId === p.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
                )}>
                
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light animate-pulse" />}
                    <span className="text-[10px] font-mono text-gray-400">{p.mrn}</span>
                  </div>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1',
                    p.status === 'Critical' ? 'bg-emergency/15 text-emergency-light' : 
                    p.status === 'Observation' ? 'bg-warning/15 text-warning-light' : 'bg-blue-500/15 text-blue-300'
                  )}>{p.status}</span>
                </div>

                <h4 className="text-[14px] font-black text-white mb-1.5 leading-snug">{p.name}</h4>
                
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2">
                  <span>{p.age}y • {p.gender}</span>
                  <span className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5">{p.bed}</span>
                </div>

                {p.allergies && p.allergies.length > 0 && (
                  <div className="text-[10px] text-emergency-light font-bold mt-2 pt-2 border-t border-white/5">
                    ALLERGIES: {p.allergies.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
