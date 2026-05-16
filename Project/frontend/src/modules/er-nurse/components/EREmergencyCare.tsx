'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ERCareAction } from '../types/er.types';
import { HeartPulse, Wind, Droplet, Activity, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { actions: ERCareAction[]; }

const ActionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'oxygen': return <Wind className="w-5 h-5 text-indigo-400" />;
    case 'iv_fluid': return <Droplet className="w-5 h-5 text-teal-400" />;
    case 'ecg': return <HeartPulse className="w-5 h-5 text-warning-light" />;
    case 'injection': return <Activity className="w-5 h-5 text-emergency-light" />;
    default: return <Activity className="w-5 h-5 text-gray-400" />;
  }
};

export function EREmergencyCare({ actions }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-white tracking-wide">Quick Interventions</h3>
      </CardHeader>
      <CardBody className="p-3 flex-1 grid grid-cols-2 gap-2 overflow-y-auto max-h-[250px]">
        {actions.map(a => (
          <div key={a.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors flex flex-col justify-between group cursor-pointer">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-md bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">
                  <ActionIcon type={a.type} />
                </div>
                {a.status === 'in_progress' && (
                   <span className="flex h-2 w-2 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                   </span>
                )}
             </div>
             <div>
               <span className="text-[11px] font-bold text-white block leading-tight">{a.title}</span>
               {a.status === 'ready' ? (
                 <span className="text-[9px] text-gray-500 mt-1 flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                   <PlayCircle className="w-3 h-3" /> CLICK TO EXECUTE
                 </span>
               ) : (
                 <span className="text-[9px] text-success-light mt-1 flex items-center gap-1">
                   IN PROGRESS
                 </span>
               )}
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
