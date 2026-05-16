'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DocumentRequirement, ComplianceGap } from '../types/accreditation.types';
import { useCloseGap, useRequestDocUpdate } from '../hooks/useAccreditationAnalytics';
import { BookOpenCheck, ShieldAlert, CheckCircle2, Clock, FileText, Bell, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { documents: DocumentRequirement[]; gaps: ComplianceGap[]; accBody: string; }

export function AccreditationWorkspace({ documents, gaps, accBody }: Props) {
  const { mutate: closeGap } = useCloseGap();
  const { mutate: reqUpdate } = useRequestDocUpdate();
  const [tab, setTab] = useState<'gaps' | 'documents'>('gaps');

  const docStatusColor = { Available: 'text-success-light bg-success/10 border-success/30', Missing: 'text-emergency-light bg-emergency/15 border-emergency/30', 'Needs Update': 'text-warning-light bg-warning/15 border-warning/30', 'In Review': 'text-blue-300 bg-blue-500/15 border-blue-500/30' };

  return (
    <Card className="border-emerald-500/20 shadow-glass bg-[#020504] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-800 via-teal-600 to-emerald-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex justify-between items-start">
        <div>
          <h3 className="text-[16px] font-black text-white flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-emerald-400" /> Compliance Governance
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Manage identified gaps and track required documentation.</p>
        </div>
        <div className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 uppercase tracking-widest">
          {accBody} Target
        </div>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('gaps')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'gaps' ? 'text-emerald-400 border-emerald-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><ShieldAlert className="w-3.5 h-3.5" /> Gap Analysis</button>
        <button onClick={() => setTab('documents')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'documents' ? 'text-emerald-400 border-emerald-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><FileText className="w-3.5 h-3.5" /> Document Tracker</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* GAPS TAB */}
        {tab === 'gaps' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {gaps.map(gap => (
              <div key={gap.id} className={cn('bg-white/[0.02] border rounded-xl p-5',
                gap.severity === 'High' && gap.status === 'Open' ? 'border-emergency/30 bg-emergency/[0.05]' : 'border-white/10'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{gap.standard}</span>
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase',
                      gap.severity === 'High' ? 'bg-emergency/20 text-emergency-light' : gap.severity === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-300'
                    )}>{gap.severity} Priority</span>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded uppercase',
                    gap.status === 'Open' ? 'text-emergency-light' : gap.status === 'In Progress' ? 'text-warning-light' : 'text-success-light'
                  )}>{gap.status}</span>
                </div>
                
                <p className="text-[13px] font-bold text-white mb-3">{gap.description}</p>
                
                <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Required Action</p>
                  <p className="text-[11px] text-gray-300 font-semibold">{gap.actionRequired}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/[0.04]">
                  <p className="text-[10px] text-gray-500">Dept: {gap.department} • Due: {new Date(gap.dueDate).toLocaleDateString()}</p>
                  {gap.status !== 'Resolved' && (
                    <Button size="sm" onClick={() => closeGap(gap.id)}
                      className="h-8 text-[11px] bg-success/15 hover:bg-success/25 text-success-light border border-success/30" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Mark Resolved</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab === 'documents' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {documents.map(doc => (
              <div key={doc.id} className={cn('bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-colors hover:bg-white/[0.04]',
                doc.status === 'Missing' || doc.status === 'Needs Update' ? 'bg-emergency/[0.03] border-emergency/20' : ''
              )}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-[13px] font-bold text-white truncate">{doc.title}</h4>
                    <span className="text-[9px] font-bold text-gray-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/10 uppercase">{doc.type}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{doc.department} • {doc.version} • Last updated: {doc.lastUpdated !== 'N/A' ? new Date(doc.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn('text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider', docStatusColor[doc.status])}>{doc.status}</span>
                  {(doc.status === 'Missing' || doc.status === 'Needs Update') && (
                    <Button size="sm" onClick={() => reqUpdate(doc.id)} className="h-7 text-[10px] bg-warning/15 hover:bg-warning/25 text-warning-light border border-warning/30" leftIcon={<Bell className="w-3 h-3" />}>Request</Button>
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
