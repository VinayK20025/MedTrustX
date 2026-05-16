'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ANMPatient } from '../types/anm.types';
import { Users, Baby } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { patients: ANMPatient[]; }

export function ANMPatientCards({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Community Roster</h3>
        </div>
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto space-y-3">
        {patients.map(p => (
          <div key={p.id} className={`p-4 rounded-xl border flex flex-col gap-3 group transition-all ${
            p.priority === 'high' ? 'border-warning/30 bg-warning/5 hover:border-warning/50' : 'border-white/[0.06] bg-surface-dark hover:border-indigo-500/30'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${p.type === 'pregnant_woman' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'}`}>
                   {p.type === 'pregnant_woman' ? <Users className="w-5 h-5" /> : <Baby className="w-5 h-5" />}
                 </div>
                 <div>
                   <span className="text-sm font-bold text-white block">{p.name}</span>
                   <span className="text-[12px] text-gray-400 mt-1 block">{p.village} • Last Visit: {p.lastVisit}</span>
                 </div>
              </div>
              {p.priority === 'high' && (
                <span className="text-[10px] font-bold bg-warning/20 text-warning-light px-2 py-1 rounded">HIGH PRIORITY</span>
              )}
            </div>
            
            <div className="bg-white/[0.02] p-2 rounded text-[13px] text-gray-300">
               Status: <span className="font-semibold text-white">{p.status}</span>
            </div>

            <div className="flex justify-end mt-1 gap-2">
               <Button size="sm" variant="outline" className="h-8 text-xs border-white/10 hover:bg-white/5">View Details</Button>
               <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 font-bold border-none">Record Visit</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
