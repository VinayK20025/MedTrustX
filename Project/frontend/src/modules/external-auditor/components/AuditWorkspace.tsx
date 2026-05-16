'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AuditCheckItem, AuditFinding } from '../types/external-auditor.types';
import { useCloseFinding } from '../hooks/useAuditorAnalytics';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Circle, CheckCircle2, XCircle, AlertTriangle, Paperclip } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { checklist: AuditCheckItem[]; findings: AuditFinding[]; }

const checkStatusStyle: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Compliant': { icon: CheckCircle2, color: 'text-success-light', bg: 'bg-success/10 border-success/30' },
  'Non-Compliant': { icon: XCircle, color: 'text-emergency-light', bg: 'bg-emergency/10 border-emergency/30' },
  'Partial': { icon: ShieldQuestion, color: 'text-warning-light', bg: 'bg-warning/10 border-warning/30' },
  'Not Assessed': { icon: Circle, color: 'text-gray-500', bg: 'bg-white/[0.02] border-white/10' },
};
const severityColor: Record<string, string> = {
  Critical: 'bg-red-600/20 text-red-400 border-red-600/30',
  Major: 'bg-emergency/15 text-emergency-light border-emergency/30',
  Minor: 'bg-warning/15 text-warning-light border-warning/30',
  Observation: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
};

export function AuditWorkspace({ checklist, findings }: Props) {
  const { mutate: closeFinding } = useCloseFinding();
  const [tab, setTab] = useState<'checklist' | 'findings'>('checklist');

  const compliant = checklist.filter(c => c.status === 'Compliant').length;
  const total = checklist.length;

  return (
    <Card className="border-amber-500/20 shadow-glass bg-[#040302] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-800 via-yellow-500 to-orange-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" /> Compliance Evaluation Engine
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Standards-mapped checklist verification with evidence linking and finding classification.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('checklist')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'checklist' ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Compliance Checklist
          <span className="ml-1.5 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{compliant}/{total}</span>
        </button>
        <button onClick={() => setTab('findings')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'findings' ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Findings
          {findings.filter(f => f.status === 'Open').length > 0 && (
            <span className="ml-1.5 bg-emergency/20 text-emergency-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">{findings.filter(f => f.status === 'Open').length}</span>
          )}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'checklist' && (
          <div className="p-5 space-y-2">
            {checklist.map(item => {
              const style = checkStatusStyle[item.status];
              const Icon = style.icon;
              return (
                <div key={item.id} className={cn('border rounded-xl p-4 flex items-start gap-3', style.bg)}>
                  <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', style.color)} />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-white">{item.criteria}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">{item.standard}</span>
                      {item.evidenceLinked && (
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1"><Paperclip className="w-2.5 h-2.5" /> Evidence Linked</span>
                      )}
                      {!item.evidenceLinked && item.status !== 'Not Assessed' && (
                        <span className="text-[9px] text-warning-light font-bold flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> No Evidence</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'findings' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Audit Findings & Observations</p>
            {findings.map(f => (
              <div key={f.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border', severityColor[f.severity])}>
                    {f.severity === 'Critical' && <ShieldAlert className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />}
                    {f.severity}
                  </span>
                  <span className={cn('text-[10px] font-bold uppercase',
                    f.status === 'Open' ? 'text-emergency-light' : f.status === 'Closed' ? 'text-success-light' : 'text-blue-400'
                  )}>{f.status}</span>
                </div>
                <p className="text-[14px] font-bold text-white mb-1">{f.issue}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                  <span>Dept: <strong className="text-gray-300">{f.department}</strong></span>
                  {f.evidenceRef && <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {f.evidenceRef}</span>}
                </div>
                {f.status === 'Open' && (
                  <Button onClick={() => closeFinding(f.id)} size="sm" className="bg-white/5 border-white/10 text-[11px] hover:bg-white/10">Close Finding</Button>
                )}
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
