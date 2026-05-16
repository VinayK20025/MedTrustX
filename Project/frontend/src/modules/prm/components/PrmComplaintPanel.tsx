'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PatientComplaint } from '../types/prm.types';
import { useEscalateComplaint, useResolveComplaint } from '../hooks/usePrmAnalytics';
import { AlertOctagon, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { complaints: PatientComplaint[]; }

export function PrmComplaintPanel({ complaints }: Props) {
  const { mutate: escalate, isPending: isEscalating } = useEscalateComplaint();
  const { mutate: resolve, isPending: isResolving } = useResolveComplaint();

  return (
    <Card className="border-rose-500/30 shadow-glass bg-[#080304] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-rose-400">ACTIVE COMPLAINTS & GRIEVANCES</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {complaints.map(cmp => (
            <div key={cmp.id} className="p-5 border-l-2 border-l-transparent hover:border-l-rose-500 transition-colors bg-surface-dark hover:bg-white/[0.02]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white mb-1">{cmp.patientName}</h4>
                  <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-mono">{cmp.category}</span>
                </div>
                <div className="text-right">
                  <span className={cn("text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider", 
                    cmp.priority === 'High' || cmp.priority === 'Urgent' ? 'bg-emergency/20 text-emergency-light animate-pulse' : 'bg-warning/20 text-warning-light'
                  )}>
                    {cmp.priority} Priority
                  </span>
                </div>
              </div>

              <div className="text-[12px] text-gray-400 mb-4 bg-black/40 p-3 rounded border border-white/5 leading-relaxed">
                {cmp.description}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mb-4">
                 <span>Assigned: {cmp.assignedToDepartment}</span>
                 <span>Status: <span className={cn(cmp.status === 'New' ? "text-emergency-light" : "text-warning-light")}>{cmp.status}</span></span>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                 <Button 
                   size="sm" 
                   disabled={isEscalating}
                   onClick={() => escalate(cmp.id)}
                   className="h-8 bg-surface-dark border border-white/10 hover:bg-white/5 text-gray-300"
                   leftIcon={<ArrowUpRight className="w-3.5 h-3.5"/>}
                 >
                   Escalate
                 </Button>
                 <Button 
                   size="sm" 
                   disabled={isResolving}
                   onClick={() => resolve({ complaintId: cmp.id, notes: 'Resolved by PRM' })}
                   className="h-8 bg-rose-600 hover:bg-rose-500 text-white font-bold"
                   leftIcon={<CheckCircle2 className="w-3.5 h-3.5"/>}
                 >
                   Resolve
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
