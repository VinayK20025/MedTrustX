'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardCoverage } from '../types/nursing.types';
import { Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { coverage: WardCoverage[]; }

export function NursingWardPanel({ coverage }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Ward Coverage</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[300px]">
        {coverage.map(w => {
          const isShort = w.status === 'shortage' || w.status === 'critical_shortage';
          return (
            <div key={w.id} className={`p-4 rounded-lg border ${isShort ? 'border-warning/30 bg-warning/5' : 'border-white/[0.06] bg-white/[0.02]'}`}>
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <span className="text-sm font-bold text-white block">{w.wardName}</span>
                   <span className="text-[10px] text-gray-400">Patients: {w.patientLoad}</span>
                 </div>
                 {isShort && <AlertTriangle className="w-4 h-4 text-warning-light" />}
               </div>
               
               <div className="mt-3 grid grid-cols-2 gap-2">
                 <div className="bg-surface-dark p-2 rounded text-center">
                   <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Required</span>
                   <span className="text-lg font-bold text-gray-300">{w.nursesRequired}</span>
                 </div>
                 <div className={`p-2 rounded text-center ${isShort ? 'bg-warning/20' : 'bg-surface-dark'}`}>
                   <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Assigned</span>
                   <span className={`text-lg font-bold ${isShort ? 'text-warning-light' : 'text-success-light'}`}>{w.nursesAssigned}</span>
                 </div>
               </div>

               {isShort && (
                 <Button size="sm" className="w-full mt-3 h-7 text-[10px] bg-warning hover:bg-warning-light text-black border-none font-bold">
                   Allocate Staff Now
                 </Button>
               )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
