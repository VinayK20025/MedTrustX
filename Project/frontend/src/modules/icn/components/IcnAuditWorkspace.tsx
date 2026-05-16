'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { IcnAudit, IcnTask } from '../types/icn.types';
import { useUpdateChecklistItem, useSubmitAudit, useUpdateIcnTask } from '../hooks/useIcnAnalytics';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Camera } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: IcnTask; audit?: IcnAudit; }

export function IcnAuditWorkspace({ task, audit }: Props) {
  const { mutate: updateItem } = useUpdateChecklistItem();
  const { mutate: submitAudit } = useSubmitAudit();
  const { mutate: updateTask } = useUpdateIcnTask();

  if (!task) {
    return (
      <Card className="border-teal-500/20 shadow-glass bg-[#030606] h-full flex items-center justify-center">
        <div className="text-center opacity-40">
          <ClipboardCheck className="w-12 h-12 text-teal-500 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select a task from the list to begin.</p>
        </div>
      </Card>
    );
  }

  // If it's a non-audit task
  if (task.type !== 'Hygiene Audit' && task.type !== 'PPE Audit') {
    return (
      <Card className="border-teal-500/20 shadow-glass bg-[#030606] h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-teal-600" />
        <CardHeader className="border-b border-white/[0.04] p-5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{task.type} • {task.ward}</span>
          <h3 className="text-[20px] font-black text-white mt-1">{task.title}</h3>
        </CardHeader>
        <CardBody className="p-5 flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Complete the required actions in the field.</p>
          </div>
          {task.status !== 'Completed' && (
            <Button onClick={() => updateTask({ id: task.id, status: 'Completed' })}
              className="h-12 w-full max-w-sm text-[14px] font-black bg-success/20 hover:bg-success/30 text-success-light border border-success/40">
              Mark Task Completed
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  // If it's an audit but data is missing
  if (!audit) return <Card className="border-white/[0.06] bg-surface-light h-full"><CardBody>Loading audit details...</CardBody></Card>;

  const allDone = audit.items.every(i => i.status !== 'Pending');

  return (
    <Card className="border-teal-500/20 shadow-glass bg-[#030606] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-800 to-cyan-600" />

      <CardHeader className="border-b border-white/[0.04] p-5 bg-black/20">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{audit.type} Audit • {audit.ward}</span>
            <h3 className="text-[20px] font-black text-white mt-1">{task.title}</h3>
          </div>
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase',
            audit.status === 'Draft' ? 'bg-warning/15 text-warning-light' : 'bg-success/15 text-success-light'
          )}>{audit.status}</span>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {/* Checklist */}
        <div className="p-5 space-y-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Compliance Checklist</p>

          <div className="space-y-3">
            {audit.items.map((item, idx) => (
              <div key={item.id} className={cn('rounded-xl border p-4 transition-all',
                item.status === 'Pass' ? 'bg-success/[0.03] border-success/20' :
                item.status === 'Fail' ? 'bg-emergency/[0.04] border-emergency/30' : 'bg-white/[0.02] border-white/10'
              )}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[12px] font-mono text-gray-500">{idx + 1}.</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[14px] font-semibold', item.status !== 'Pending' ? 'text-gray-300' : 'text-white')}>{item.label}</p>
                    {item.notes && <p className="text-[11px] text-emergency-light mt-1 bg-emergency/10 p-1.5 rounded italic">"{item.notes}"</p>}
                  </div>
                </div>

                {audit.status === 'Draft' && (
                  <div className="flex items-center gap-2 mt-4 ml-7">
                    <Button size="sm" onClick={() => updateItem({ auditId: audit.id, itemId: item.id, status: 'Pass' })}
                      className={cn('flex-1 h-10 border transition-all',
                        item.status === 'Pass' ? 'bg-success/20 text-success-light border-success/40' : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                      )} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Pass</Button>

                    <Button size="sm" onClick={() => updateItem({ auditId: audit.id, itemId: item.id, status: 'Fail', notes: 'Observed non-compliance' })}
                      className={cn('flex-1 h-10 border transition-all',
                        item.status === 'Fail' ? 'bg-emergency/20 text-emergency-light border-emergency/40' : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                      )} leftIcon={<XCircle className="w-4 h-4" />}>Fail</Button>

                    <Button size="sm" className="h-10 px-3 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10" leftIcon={<Camera className="w-4 h-4" />} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submission area */}
        <div className="p-5 border-t border-white/[0.04] bg-black/40 mt-4">
          {audit.status === 'Submitted' ? (
            <div className="flex items-center justify-center gap-2 text-success-light bg-success/10 p-3 rounded-xl border border-success/20">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-[14px]">Audit Submitted</span>
            </div>
          ) : (
            <Button onClick={() => submitAudit(audit.id)} disabled={!allDone}
              className={cn('w-full h-12 text-[14px] font-black border',
                allDone ? 'bg-teal-600 hover:bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
              )}>
              {allDone ? 'Submit Audit Report' : 'Complete All Checks to Submit'}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
