'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { LegalCheckItem, Violation, EnforcementAction } from '../types/reg-inspector.types';
import { useIssueNotice, useCloseViolation } from '../hooks/useInspectorAnalytics';
import { Gavel, CheckCircle2, XCircle, AlertTriangle, Circle, Camera, MapPin, FileWarning, Send } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { checklist: LegalCheckItem[]; violations: Violation[]; actions: EnforcementAction[]; }

const checkStyle: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Compliant': { icon: CheckCircle2, color: 'text-success-light', bg: 'bg-success/10 border-success/30' },
  'Violation': { icon: XCircle, color: 'text-emergency-light', bg: 'bg-emergency/10 border-emergency/30' },
  'Partial': { icon: AlertTriangle, color: 'text-warning-light', bg: 'bg-warning/10 border-warning/30' },
  'Not Inspected': { icon: Circle, color: 'text-gray-500', bg: 'bg-white/[0.02] border-white/10' },
};
const sevColor: Record<string, string> = { Critical: 'bg-red-600/20 text-red-400 border-red-600/30', Major: 'bg-emergency/15 text-emergency-light border-emergency/30', Minor: 'bg-warning/15 text-warning-light border-warning/30' };

export function InspectionWorkspace({ checklist, violations, actions }: Props) {
  const { mutate: issueNotice } = useIssueNotice();
  const { mutate: closeViolation } = useCloseViolation();
  const [tab, setTab] = useState<'checklist' | 'violations' | 'enforcement'>('checklist');

  const compliant = checklist.filter(c => c.status === 'Compliant').length;

  return (
    <Card className="border-red-500/20 shadow-glass bg-[#050202] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-900 via-red-500 to-orange-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Gavel className="w-5 h-5 text-red-400" /> Regulatory Inspection Engine
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Statutory compliance verification, evidence-backed violations, and legal enforcement actions.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20 overflow-x-auto">
        <button onClick={() => setTab('checklist')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 whitespace-nowrap', tab === 'checklist' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Legal Checklist
          <span className="ml-1.5 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{compliant}/{checklist.length}</span>
        </button>
        <button onClick={() => setTab('violations')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 whitespace-nowrap', tab === 'violations' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Violations
          {violations.filter(v => v.status === 'Open').length > 0 && (
            <span className="ml-1.5 bg-emergency/20 text-emergency-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">{violations.filter(v => v.status === 'Open').length}</span>
          )}
        </button>
        <button onClick={() => setTab('enforcement')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap', tab === 'enforcement' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Enforcement</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'checklist' && (
          <div className="p-5 space-y-2">
            {checklist.map(item => {
              const style = checkStyle[item.status];
              const Icon = style.icon;
              return (
                <div key={item.id} className={cn('border rounded-xl p-4 flex items-start gap-3', style.bg)}>
                  <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', style.color)} />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-white">{item.criteria}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[9px] font-bold text-gray-400 bg-black/30 px-2 py-0.5 rounded">{item.law}</span>
                      <span className="text-[9px] font-bold text-gray-500 bg-black/20 px-2 py-0.5 rounded">{item.section}</span>
                      {item.evidenceCaptured && (
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1"><Camera className="w-2.5 h-2.5" /> Evidence</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'violations' && (
          <div className="p-5 space-y-3">
            {violations.map(v => (
              <div key={v.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border', sevColor[v.severity])}>
                    {v.severity === 'Critical' && <FileWarning className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />}
                    {v.severity}
                  </span>
                  <span className={cn('text-[10px] font-bold uppercase',
                    v.status === 'Open' ? 'text-emergency-light' : v.status === 'Notice Issued' ? 'text-orange-400' : v.status === 'Rectified' ? 'text-success-light' : 'text-blue-400'
                  )}>{v.status}</span>
                </div>
                <p className="text-[14px] font-bold text-white mb-1">{v.issue}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3 flex-wrap">
                  <span>Law: <strong className="text-gray-300">{v.law}</strong></span>
                  <span>Dept: <strong className="text-gray-300">{v.department}</strong></span>
                  {v.geoTag && <span className="flex items-center gap-1 text-cyan-400"><MapPin className="w-3 h-3" /> {v.geoTag}</span>}
                  {v.evidenceCount > 0 && <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {v.evidenceCount} items</span>}
                </div>
                <div className="flex gap-2">
                  {v.status === 'Open' && (
                    <Button onClick={() => issueNotice({ violationId: v.id, type: 'Show Cause' })} size="sm" className="bg-red-500/10 text-red-400 border-red-500/30 text-[11px] hover:bg-red-500/20" leftIcon={<Send className="w-3 h-3" />}>Issue Notice</Button>
                  )}
                  {(v.status === 'Notice Issued' || v.status === 'Penalty Applied') && (
                    <Button onClick={() => closeViolation(v.id)} size="sm" className="bg-white/5 border-white/10 text-[11px] hover:bg-white/10">Mark Rectified</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'enforcement' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Enforcement Action Log</p>
            {actions.map(a => (
              <div key={a.id} className={cn('border rounded-xl p-4',
                a.type === 'Closure Order' || a.type === 'Suspension' ? 'bg-red-600/10 border-red-600/30' :
                a.type === 'Fine' ? 'bg-emergency/10 border-emergency/30' :
                a.type === 'Show Cause' ? 'bg-warning/10 border-warning/30' : 'bg-blue-500/10 border-blue-500/30'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[13px] font-bold text-white flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-red-400" /> {a.type}
                  </span>
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider',
                    a.status === 'Draft' ? 'text-gray-400' : a.status === 'Issued' ? 'text-red-400' : 'text-success-light'
                  )}>{a.status}</span>
                </div>
                <p className="text-[10px] text-gray-400">Violation: <strong className="text-gray-300">{a.violationId}</strong></p>
                {a.issuedAt && <p className="text-[10px] text-gray-500 mt-1">Issued: {new Date(a.issuedAt).toLocaleString()}</p>}
              </div>
            ))}

            {actions.length === 0 && (
              <div className="text-center py-10 opacity-40">
                <Gavel className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-[11px] text-gray-500 font-bold">No enforcement actions taken yet.</p>
              </div>
            )}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
