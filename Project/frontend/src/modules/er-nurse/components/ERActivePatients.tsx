'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ERActivePatient } from '../types/er.types';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { patients: ERActivePatient[]; }

export function ERActivePatients({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Active Cases</h3>
        </div>
      </CardHeader>
      <CardBody className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[250px]">
        {patients.map(p => (
          <div key={p.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark flex flex-col gap-2">
            <div className="flex justify-between items-start">
               <div>
                 <span className="text-[13px] font-bold text-white block">{p.name}</span>
                 <span className="text-[10px] text-gray-400">{p.chiefComplaint}</span>
               </div>
               <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                 p.status === 'resus' ? 'bg-emergency/20 text-emergency-light' : 
                 p.status === 'treatment' ? 'bg-indigo-500/20 text-indigo-300' : 
                 'bg-warning/20 text-warning-light'
               }`}>
                 {p.status.replace('_', ' ')}
               </span>
            </div>
            <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/[0.04]">
               <span className="text-[10px] font-mono text-gray-500">{p.location}</span>
               <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] border-white/10">Manage</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
