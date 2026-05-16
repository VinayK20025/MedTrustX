'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OTChecklistItem } from '../types/ot.types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { checklist: OTChecklistItem[]; }

export function OTPreOpChecklist({ checklist }: Props) {
  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/10 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Surgical Timeout Validation</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2 overflow-y-auto">
        {checklist.map(item => (
          <div key={item.id} className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
            item.status === 'confirmed' ? 'border-success/30 bg-success/5' : 
            'border-white/[0.06] bg-surface-dark'
          }`}>
             <div className="flex items-center gap-3">
               {item.status === 'confirmed' ? (
                 <CheckCircle2 className="w-5 h-5 text-success" />
               ) : (
                 <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
               )}
               <div>
                 <span className={`text-sm font-bold block ${item.status === 'confirmed' ? 'text-success-light' : 'text-white'}`}>
                   {item.task}
                 </span>
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest">{item.category}</span>
               </div>
             </div>
             {item.status !== 'confirmed' && (
               <Button size="sm" className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-none">Verify</Button>
             )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
