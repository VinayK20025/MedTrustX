'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NursePatient } from '../types/nurse.types';
import { Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { patients: NursePatient[]; }

export function NursePatientPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">My Patients</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {patients.map(p => (
          <div key={p.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark flex flex-col gap-2">
            <div className="flex justify-between items-start">
               <div>
                 <span className="text-sm font-bold text-white block">{p.name}</span>
                 <span className="text-[10px] text-gray-400 font-mono">{p.bed}</span>
               </div>
               <span className={`w-2 h-2 rounded-full ${p.status === 'critical' ? 'bg-emergency' : p.status === 'observation' ? 'bg-warning' : 'bg-success'}`} />
            </div>
            <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/[0.04]">
               <span className="text-[10px] text-gray-400 flex items-center gap-1">
                 <Clock className="w-3 h-3" /> Next: {p.nextTaskTime}
               </span>
               <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]">Open Chart</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
