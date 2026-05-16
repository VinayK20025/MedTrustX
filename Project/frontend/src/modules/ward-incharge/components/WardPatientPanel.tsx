'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardPatient } from '../types/ward.types';
import { Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { patients: WardPatient[]; }

export function WardPatientPanel({ patients }: Props) {
  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Critical Patients</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {patients.filter(p => p.status === 'critical' || p.status === 'observation').map(p => (
          <div key={p.id} className={`p-3 rounded-lg border ${p.status === 'critical' ? 'border-emergency/30 bg-emergency/10' : 'border-warning/30 bg-warning/10'}`}>
            <div className="flex justify-between items-start mb-2">
               <div>
                 <span className="text-sm font-bold text-white block">{p.name}</span>
                 <span className="text-[10px] text-gray-300 font-mono">{p.bed} | {p.diagnosis}</span>
               </div>
               {p.status === 'critical' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
            </div>
            <div className="flex justify-between items-end">
               <span className="text-[10px] text-gray-400">Assigned: {p.assignedNurse || 'Unassigned'}</span>
               <Button size="sm" className={`h-6 px-2 text-[10px] text-white border-none ${p.status === 'critical' ? 'bg-emergency hover:bg-emergency-light' : 'bg-warning hover:bg-warning-light text-black'}`}>
                 Prioritize Care
               </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
