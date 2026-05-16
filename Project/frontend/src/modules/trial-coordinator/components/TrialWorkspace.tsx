'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { VisitTask, ProtocolDeviation } from '../types/trial-coordinator.types';
import { useCompleteVisitTask, useResolveDeviation } from '../hooks/useTrialCoordAnalytics';
import { ClipboardList, TestTube, FileCheck, ShieldAlert, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: VisitTask[]; deviations: ProtocolDeviation[]; }

const TaskIcon: Record<string, React.ElementType> = { Lab: TestTube, Assessment: ClipboardList, Document: FileCheck, Consent: ShieldAlert };

export function TrialWorkspace({ tasks, deviations }: Props) {
  const { mutate: completeTask } = useCompleteVisitTask();
  const { mutate: resolveDeviation } = useResolveDeviation();
  const [tab, setTab] = useState<'visit' | 'deviations'>('visit');

  const allDone = tasks.every(t => t.isCompleted);

  return (
    <Card className="border-indigo-500/20 shadow-glass bg-[#020305] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-800 via-violet-500 to-blue-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" /> Trial Operations Workspace
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Execute visit protocols, manage CRFs, and track compliance deviations.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('visit')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'visit' ? 'text-indigo-400 border-indigo-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Visit Checklist</button>
        <button onClick={() => setTab('deviations')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'deviations' ? 'text-indigo-400 border-indigo-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Deviations
          {deviations.filter(d => d.status === 'Open').length > 0 && (
            <span className="ml-1.5 bg-emergency/20 text-emergency-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">{deviations.filter(d => d.status === 'Open').length}</span>
          )}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">

        {tab === 'visit' && (
          <div className="flex flex-col h-full">
            <div className="p-5 space-y-3 flex-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Visit Protocol — Required Steps</p>
              {tasks.map(t => {
                const Icon = TaskIcon[t.type] || ClipboardList;
                return (
                  <div key={t.id} onClick={() => !t.isCompleted && completeTask(t.id)}
                    className={cn('p-4 rounded-xl border-2 flex items-center gap-4 transition-all',
                      t.isCompleted ? 'bg-success/10 border-success/30 text-success-light' : 'bg-white/[0.03] border-white/10 text-white cursor-pointer hover:bg-white/[0.06] active:scale-[0.98]'
                    )}>
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      t.isCompleted ? 'bg-success/20 text-success-light' : 'bg-white/10 text-gray-400'
                    )}>
                      {t.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <span className={cn('text-[14px] font-bold block', t.isCompleted && 'line-through opacity-70')}>{t.label}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-white/5 bg-black/40">
              <Button disabled={!allDone} className={cn('w-full h-12 text-[13px] font-bold border',
                allDone ? 'bg-success/20 text-success-light border-success/40 hover:bg-success/30' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
              )} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                {allDone ? 'Close Visit & Lock CRF' : 'Complete All Steps to Close Visit'}
              </Button>
            </div>
          </div>
        )}

        {tab === 'deviations' && (
          <div className="p-5 space-y-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Protocol Deviation Log</p>
            {deviations.map(d => (
              <div key={d.id} className={cn('border rounded-xl p-4',
                d.severity === 'Major' ? 'bg-emergency/10 border-emergency/30' : 'bg-warning/10 border-warning/30'
              )}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono text-gray-400">{d.subject}</span>
                  <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1',
                    d.severity === 'Major' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                  )}>
                    <AlertTriangle className="w-2.5 h-2.5" /> {d.severity}
                  </span>
                </div>
                <p className="text-[14px] font-bold text-white mb-3">{d.issue}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">{new Date(d.reportedAt).toLocaleDateString()}</span>
                  {d.status === 'Open' && (
                    <Button onClick={() => resolveDeviation(d.id)} size="sm" className="bg-white/5 border-white/10 text-[11px] hover:bg-white/10">Mark Resolved</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
