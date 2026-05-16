'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MetTask, MetDevice } from '../types/met.types';
import { useUpdateDiagnosticStep, useUpdateMetTaskStatus } from '../hooks/useMetAnalytics';
import { Wrench, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: MetTask; device?: MetDevice; }

export function MetDeviceWorkspace({ task, device }: Props) {
  const { mutate: updateStep } = useUpdateDiagnosticStep();
  const { mutate: updateStatus } = useUpdateMetTaskStatus();

  if (!task) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center min-h-[400px]">
        <Wrench className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
        <p className="text-gray-500 font-bold">Select a device task to begin diagnostics.</p>
      </Card>
    );
  }

  const allPassed = task.diagnosticsFlow.every(s => s.status === 'Passed');

  return (
    <Card className="border-teal-500/30 shadow-glass bg-surface-light h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-white">Diagnostic Workspace: {task.deviceId}</h3>
          </div>
          <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20 uppercase">{task.status}</span>
        </div>
        <div className="text-[11px] text-gray-400">Target: {device?.name} at {device?.location} ({device?.department})</div>
        {device?.errorCode && (
          <div className="mt-2 bg-emergency/10 border border-emergency/20 text-emergency-light text-[11px] font-mono px-3 py-1.5 rounded font-bold inline-flex w-fit">
            SYS ERROR: {device.errorCode}
          </div>
        )}
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-5 border-b border-white/[0.04]">
          <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Diagnostic Flow & Resolution</h4>
          <div className="space-y-3">
            {task.diagnosticsFlow.map((step, idx) => (
              <div key={step.id} className={cn("p-4 border rounded-xl transition-colors", 
                step.status === 'Passed' ? 'bg-success/5 border-success/20' : 
                step.status === 'Failed' ? 'bg-emergency/5 border-emergency/20' : 'bg-surface-dark border-white/5'
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="font-mono text-gray-600 text-[10px] w-4 mt-0.5">{idx + 1}.</div>
                    <div>
                      <span className={cn("text-[13px] font-bold", step.status === 'Passed' ? 'text-gray-400 line-through' : 'text-white')}>{step.instruction}</span>
                      <div className="mt-1">
                        <span className="text-[9px] uppercase font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded mr-2">{step.actionType}</span>
                        {step.resultNotes && <span className="text-[10px] text-emergency-light italic">Note: {step.resultNotes}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {step.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button size="xs" onClick={() => updateStep({ taskId: task.id, stepId: step.id, status: 'Failed' })} className="h-7 text-[10px] bg-emergency/20 hover:bg-emergency/30 text-emergency-light border-none font-bold">
                        Fail
                      </Button>
                      <Button size="xs" onClick={() => updateStep({ taskId: task.id, stepId: step.id, status: 'Passed' })} className="h-7 text-[10px] bg-success hover:bg-success-light border-none font-bold text-white">
                        Pass
                      </Button>
                    </div>
                  )}
                  {step.status === 'Passed' && <CheckCircle2 className="w-5 h-5 text-success-light" />}
                  {step.status === 'Failed' && <XCircle className="w-5 h-5 text-emergency-light" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 flex justify-between items-center bg-black/20">
          <Button variant="ghost" size="sm" onClick={() => updateStatus({ taskId: task.id, status: 'Escalated' })} className="text-warning-light hover:bg-warning/10" leftIcon={<ShieldAlert className="w-4 h-4" />}>
            Escalate to OEM
          </Button>
          
          <Button onClick={() => updateStatus({ taskId: task.id, status: 'Resolved' })} disabled={!allPassed} className={cn("font-bold", allPassed ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-surface-dark text-gray-500")}>
            Mark Resolved
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
