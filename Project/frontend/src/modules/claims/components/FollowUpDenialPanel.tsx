'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ClaimFollowUp } from '../types/claims.types';
import { useCompleteFollowUp } from '../hooks/useClaimsAnalytics';
import { BellRing, CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { followUps: ClaimFollowUp[]; }

const statusColor: Record<ClaimFollowUp['status'], string> = {
  Pending: 'bg-blue-500/20 text-blue-300',
  Overdue: 'bg-emergency/20 text-emergency-light border border-emergency/30',
  Completed: 'bg-success/20 text-success-light',
};

export function FollowUpDenialPanel({ followUps }: Props) {
  const { mutate: complete, isPending } = useCompleteFollowUp();
  const pendingCount = followUps.filter(f => f.status !== 'Completed').length;
  const overdueCount = followUps.filter(f => f.status === 'Overdue').length;

  return (
    <div className="flex flex-col gap-5 h-full">
      <Card className={cn("shadow-glass flex-1 flex flex-col", overdueCount > 0 ? "border-emergency/30" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 text-indigo-400" />
            <h3 className="text-[12px] font-bold tracking-widest text-indigo-400">FOLLOW-UP TRACKER</h3>
          </div>
          {pendingCount > 0 && <span className={cn("text-[9px] px-2 py-0.5 rounded font-bold uppercase", overdueCount > 0 ? "bg-emergency/20 text-emergency-light" : "bg-blue-500/20 text-blue-300")}>{pendingCount} Tasks</span>}
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {followUps.map(f => (
              <div key={f.id} className={cn("p-4", f.status === 'Overdue' && "bg-emergency/[0.03]")}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-[12px] font-bold text-white">{f.patientName}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{f.insurer} • {f.claimId}</p>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", statusColor[f.status])}>{f.status}</span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded p-2 mt-2 mb-3">
                  <p className="text-[11px] text-gray-300 leading-relaxed"><span className="text-gray-500">Action:</span> {f.nextAction}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-gray-500"><CalendarClock className="w-3 h-3" /> Due: {new Date(f.dueDate).toLocaleDateString()}</span>
                  {f.status !== 'Completed' && (
                    <Button size="sm" disabled={isPending} onClick={() => complete(f.id)} className="h-7 text-[10px] bg-white/5 hover:bg-success/20 hover:text-success-light text-gray-300" leftIcon={<CheckCircle2 className="w-3 h-3" />}>Mark Done</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
        <div className="p-3 border-t border-white/5">
          <Button className="w-full h-9 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold" leftIcon={<Clock className="w-3 h-3" />}>Schedule Follow-up</Button>
        </div>
      </Card>
    </div>
  );
}
