'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { LegalCase, CaseTimelineEvent, LegalDocument, VendorContract } from '../types/legal.types';
import { useUpdateCaseStatus, useUploadLegalDoc, useRenewContract } from '../hooks/useLegalAnalytics';
import { Scale, Lock, Clock, FileText, Briefcase, FilePlus2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { legalCase?: LegalCase; timeline: CaseTimelineEvent[]; documents: LegalDocument[]; contracts: VendorContract[]; }

export function LegalWorkspace({ legalCase, timeline, documents, contracts }: Props) {
  const { mutate: updateStatus } = useUpdateCaseStatus();
  const { mutate: uploadDoc } = useUploadLegalDoc();
  const { mutate: renew } = useRenewContract();
  const [tab, setTab] = useState<'case' | 'documents' | 'contracts'>('case');

  const tabs = [
    { key: 'case' as const, label: 'Case & Timeline', icon: Scale },
    { key: 'documents' as const, label: 'Confidential Documents', icon: Lock },
    { key: 'contracts' as const, label: 'Vendor Contracts', icon: Briefcase },
  ];

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-900 via-blue-600 to-indigo-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" /> Legal & Compliance Governance
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Secure litigation tracking, evidence management, and contract review.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* CASE & TIMELINE TAB */}
        {tab === 'case' && (
          <div className="p-5 animate-fade-in">
            {!legalCase ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-40">
                <Scale className="w-12 h-12 text-blue-500 mb-4" />
                <p className="text-gray-400 font-bold">Select a case from the list to view timeline</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{legalCase.id} • {legalCase.type}</span>
                  </div>
                  <h4 className="text-[20px] font-black text-white mb-2">{legalCase.title}</h4>
                  <p className="text-[13px] text-gray-300 font-mono bg-black/40 p-2 rounded inline-block border border-white/10">{legalCase.parties}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Litigation Timeline</p>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:to-transparent">
                    {timeline.filter(t => t.caseId === legalCase.id).map(evt => (
                      <div key={evt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-500 bg-blue-900/50 text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <Clock className="w-3 h-3" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/[0.03] border border-white/10 p-4 rounded shadow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] font-bold text-white">{evt.event}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">{evt.actor} • {new Date(evt.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONFIDENTIAL DOCUMENTS TAB */}
        {tab === 'documents' && (
          <div className="p-5 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-2"><Lock className="w-4 h-4" /> Restricted Access Level 3 Enabled</span>
              <Button size="sm" onClick={() => uploadDoc({ caseId: legalCase?.id || null, file: null })}
                className="h-8 text-[11px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40" leftIcon={<FilePlus2 className="w-3 h-3" />}>Upload Secure File</Button>
            </div>
            {documents.filter(d => d.caseId === legalCase?.id || !legalCase).map(doc => (
              <div key={doc.id} className="flex items-center gap-4 bg-white/[0.02] border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/[0.04]">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center border shrink-0',
                  doc.isConfidential ? 'bg-emergency/10 border-emergency/30' : 'bg-white/5 border-white/10'
                )}>
                  <FileText className={cn('w-5 h-5', doc.isConfidential ? 'text-emergency-light' : 'text-gray-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-bold text-white truncate">{doc.title}</h4>
                    {doc.isConfidential && <span className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase bg-emergency/20 text-emergency-light border-emergency/40">Confidential</span>}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{doc.type} • Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-1 rounded border',
                    doc.status === 'Final' || doc.status === 'Signed' ? 'bg-success/10 text-success-light border-success/30' : 'bg-warning/10 text-warning-light border-warning/30'
                  )}>{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTRACTS TAB */}
        {tab === 'contracts' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {contracts.map(con => (
              <div key={con.id} className={cn('rounded-xl border p-4 flex items-center gap-4 transition-colors',
                con.status === 'Breach' || con.status === 'Expiring Soon' ? 'bg-emergency/[0.03] border-emergency/30' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[14px] font-bold text-white">{con.vendor}</h4>
                    <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider',
                      con.status === 'Breach' ? 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse' :
                      con.status === 'Expiring Soon' ? 'bg-warning/20 text-warning-light border border-warning/30' :
                      'bg-success/10 text-success-light border border-success/20'
                    )}>{con.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{con.service} • Contract Value: {con.value}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <p className="text-[10px] text-gray-500">Expires: {new Date(con.expiryDate).toLocaleDateString()}</p>
                  {(con.status === 'Expiring Soon' || con.status === 'Breach') && (
                    <Button size="sm" onClick={() => renew(con.id)}
                      className="h-7 text-[10px] bg-white/10 hover:bg-white/20 text-white border-transparent">
                      Initiate Action
                    </Button>
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
