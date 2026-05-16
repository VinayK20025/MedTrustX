'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DischargePatient } from '../types/discharge.types';
import { useRequestClearance, useConfirmDischarge } from '../hooks/useDischargeAnalytics';
import { ClipboardCheck, CheckCircle2, Circle, Loader2, Ban, Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patient?: DischargePatient; }

const statusIcon: Record<string, React.ReactNode> = {
  Cleared: <CheckCircle2 className="w-5 h-5 text-success-light" />,
  'In Progress': <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
  Pending: <Circle className="w-5 h-5 text-gray-500" />,
  Blocked: <Ban className="w-5 h-5 text-emergency-light" />,
};

const statusBg: Record<string, string> = {
  Cleared: 'bg-success/10 border-success/20',
  'In Progress': 'bg-blue-500/10 border-blue-500/20',
  Pending: 'bg-white/[0.02] border-white/5',
  Blocked: 'bg-emergency/10 border-emergency/20',
};

export function DischargeWorkflowChecklist({ patient }: Props) {
  const { mutate: reqClearance, isPending: isRequesting } = useRequestClearance();
  const { mutate: confirm, isPending: isConfirming } = useConfirmDischarge();

  if (!patient) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex items-center justify-center">
      <p className="text-gray-500 text-[13px]">Select a patient to view discharge workflow</p>
    </Card>
  );

  const allCleared = patient.clearances.every(c => c.status === 'Cleared');
  const clearedCount = patient.clearances.filter(c => c.status === 'Cleared').length;

  return (
    <Card className="border-orange-500/25 shadow-glass bg-[#0a0604] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-orange-400" />
          <div>
            <h3 className="text-[15px] font-bold text-white">{patient.patientName}</h3>
            <span className="text-[10px] text-gray-500 font-mono">{patient.mrn} • {patient.ward} • Bed {patient.bed}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 font-mono block">Clearances</span>
          <span className="text-[14px] font-mono font-bold text-white">{clearedCount}/{patient.clearances.length}</span>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto flex flex-col">
        {/* Checklist Steps */}
        <div className="flex-1 space-y-3">
          {patient.clearances.map((c, i) => (
            <div key={c.department} className={cn('p-4 rounded-xl border flex items-center gap-4 transition-all', statusBg[c.status])}>
              {/* Step Number + Icon */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-mono font-bold text-gray-400">{i + 1}</span>
                {statusIcon[c.status]}
              </div>
              {/* Content */}
              <div className="flex-1">
                <h4 className="text-[13px] font-bold text-white">{c.department} Clearance</h4>
                {c.status === 'Cleared' && c.clearedBy && (
                  <p className="text-[10px] text-success-light font-mono mt-0.5">Cleared • {new Date(c.clearedAt!).toLocaleTimeString()}</p>
                )}
                {c.blockerReason && (
                  <p className="text-[10px] text-emergency-light font-mono mt-0.5">⚠ {c.blockerReason}</p>
                )}
              </div>
              {/* Action */}
              {c.status === 'Pending' && (
                <Button size="sm" disabled={isRequesting} onClick={() => reqClearance({ patientId: patient.id, department: c.department })}
                  className="h-8 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] shrink-0" leftIcon={<Bell className="w-3 h-3" />}>
                  Nudge
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Final Discharge Button */}
        <div className="pt-4 border-t border-white/5 mt-4">
          {!allCleared && (
            <div className="text-[11px] text-emergency-light bg-emergency/10 border border-emergency/20 p-3 rounded-lg mb-3 flex items-center gap-2">
              <Ban className="w-4 h-4 shrink-0" />
              Cannot discharge: {patient.clearances.filter(c => c.status !== 'Cleared').length} clearance(s) still pending.
            </div>
          )}
          <Button disabled={!allCleared || isConfirming} onClick={() => confirm(patient.id)}
            className={cn("w-full h-12 font-bold text-[14px]", allCleared ? "bg-success-600 hover:bg-success-500 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed")}
            leftIcon={<CheckCircle2 className="w-5 h-5" />}>
            CONFIRM DISCHARGE
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
