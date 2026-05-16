'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { LeaveRequest } from '../types/hrExec.types';
import { useApproveLeave, useRejectLeave } from '../hooks/useHrExecAnalytics';
import { CalendarOff, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { leaves: LeaveRequest[]; }

export function HrExecLeavePanel({ leaves }: Props) {
  const { mutate: approve, isPending: isApproving } = useApproveLeave();
  const { mutate: reject, isPending: isRejecting } = useRejectLeave();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <CalendarOff className="w-4 h-4 text-blue-400" />
        <h3 className="text-[13px] font-bold tracking-widest text-blue-400">LEAVE REQUESTS</h3>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {leaves.map(l => (
            <div key={l.id} className={cn("p-4", l.hasShiftConflict && "bg-warning/[0.03]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{l.staffName}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{l.role} • {l.department}</p>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-bold">{l.leaveType} • {l.days}d</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-2 italic">"{l.reason}"</p>
              <div className="text-[10px] text-gray-500 font-mono mb-3">
                {new Date(l.fromDate).toLocaleDateString()} → {new Date(l.toDate).toLocaleDateString()}
              </div>
              {l.hasShiftConflict && (
                <div className="text-[10px] text-warning-light bg-warning/10 border border-warning/20 p-2 rounded flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> Leave overlaps with assigned shift. Verify coverage.
                </div>
              )}
              {l.status === 'Pending' && (
                <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                  <Button size="sm" disabled={isRejecting} onClick={() => reject(l.id)} className="h-8 bg-white/5 hover:bg-emergency/10 text-gray-400 hover:text-emergency-light text-[10px]" leftIcon={<X className="w-3 h-3" />}>
                    Reject
                  </Button>
                  <Button size="sm" disabled={isApproving} onClick={() => approve(l.id)} className="h-8 bg-success-600 hover:bg-success-500 text-white text-[10px] font-bold" leftIcon={<Check className="w-3 h-3" />}>
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ))}
          {leaves.length === 0 && <div className="p-8 text-center text-[12px] text-gray-500">No pending leave requests</div>}
        </div>
      </CardBody>
    </Card>
  );
}
