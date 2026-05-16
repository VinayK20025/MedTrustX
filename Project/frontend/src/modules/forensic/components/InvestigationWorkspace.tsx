'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { EvidenceItem, CustodyEntry, ExamFinding } from '../types/forensic.types';
import { useSealEvidence, useTransferEvidence } from '../hooks/useForensicAnalytics';
import { Microscope, Lock, Send, TestTube, Shirt, Camera, FileText, Sword, Clock, CheckCircle2, AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { evidence: EvidenceItem[]; custodyLog: CustodyEntry[]; findings: ExamFinding[]; selectedCaseId?: string; }

const evidenceIcon: Record<string, React.ElementType> = { Blood: TestTube, Tissue: TestTube, Swab: TestTube, Clothing: Shirt, Weapon: Sword, Photograph: Camera, Document: FileText };
const evidenceStatusColor: Record<string, string> = { Collected: 'text-blue-400', Stored: 'text-cyan-400', 'Sent to Lab': 'text-purple-400', 'Result Received': 'text-success-light' };

const custodyIcon: Record<string, React.ElementType> = { Collected: ArrowRight, Sealed: Lock, Stored: Package, Transferred: Send, 'Lab Received': TestTube, Returned: ArrowRight };

export function InvestigationWorkspace({ evidence, custodyLog, findings, selectedCaseId }: Props) {
  const { mutate: sealEv } = useSealEvidence();
  const { mutate: transferEv } = useTransferEvidence();
  const [tab, setTab] = useState<'examination' | 'evidence' | 'custody'>('examination');

  const caseEvidence = selectedCaseId ? evidence.filter(e => e.caseId === selectedCaseId) : evidence;
  const caseFindings = selectedCaseId ? findings.filter(f => f.caseId === selectedCaseId) : findings;

  return (
    <Card className="border-red-500/20 shadow-glass bg-[#050202] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-900 via-crimson-600 to-rose-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Microscope className="w-5 h-5 text-red-400" /> Forensic Investigation Workspace
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Medico-legal examination findings, evidence collection, and tamper-proof custody chain.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20 overflow-x-auto">
        <button onClick={() => setTab('examination')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 whitespace-nowrap', tab === 'examination' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Examination
          {caseFindings.length > 0 && <span className="ml-1.5 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{caseFindings.length}</span>}
        </button>
        <button onClick={() => setTab('evidence')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 whitespace-nowrap', tab === 'evidence' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Evidence
          <span className="ml-1.5 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{caseEvidence.length}</span>
        </button>
        <button onClick={() => setTab('custody')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap', tab === 'custody' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Chain of Custody
          {evidence.some(e => !e.sealIntact) && <span className="ml-1.5 bg-emergency/20 text-emergency-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">!</span>}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'examination' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Injury Documentation & Findings</p>
            {caseFindings.length === 0 ? (
              <div className="text-center py-12 opacity-40">
                <Microscope className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-[11px] text-gray-500 font-bold">Select a case to view examination findings.</p>
              </div>
            ) : caseFindings.map(f => (
              <div key={f.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[12px] font-bold text-red-400 uppercase tracking-wider">{f.region}</span>
                  <span className="text-[9px] font-bold bg-red-500/15 text-red-300 px-2 py-0.5 rounded">{f.injuryType}</span>
                </div>
                <p className="text-[14px] text-white leading-relaxed mb-2">{f.description}</p>
                {f.weaponSuggested && (
                  <div className="text-[10px] text-gray-400">
                    Probable weapon/cause: <strong className="text-warning-light">{f.weaponSuggested}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'evidence' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Collected Evidence Items</p>
            {caseEvidence.map(ev => {
              const EvIcon = evidenceIcon[ev.type] || TestTube;
              return (
                <div key={ev.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
                    <EvIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[13px] font-bold text-white">{ev.description}</span>
                      <span className={cn('text-[9px] font-bold uppercase tracking-wider', evidenceStatusColor[ev.status])}>{ev.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2 flex-wrap">
                      <span className="bg-black/30 px-2 py-0.5 rounded font-bold text-gray-300">{ev.type}</span>
                      <span>By: {ev.collectedBy}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ev.collectedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {ev.sealIntact ? (
                        <span className="text-[10px] text-success-light font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Seal Intact</span>
                      ) : (
                        <span className="text-[10px] text-emergency-light font-bold flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> SEAL BROKEN — Integrity Compromised</span>
                      )}
                      {ev.status === 'Collected' && (
                        <Button onClick={() => sealEv(ev.id)} size="sm" className="bg-white/5 border-white/10 text-[9px] h-6 hover:bg-white/10" leftIcon={<Lock className="w-2.5 h-2.5" />}>Seal</Button>
                      )}
                      {ev.status === 'Stored' && (
                        <Button onClick={() => transferEv({ id: ev.id, recipient: 'FSL' })} size="sm" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[9px] h-6 hover:bg-purple-500/20" leftIcon={<Send className="w-2.5 h-2.5" />}>Transfer to Lab</Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'custody' && (
          <div className="p-5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Evidence Chain of Custody — Tamper-Proof Log</p>
            <div className="relative pl-6 space-y-0">
              {custodyLog.map((e, idx) => {
                const CIcon = custodyIcon[e.action] || ArrowRight;
                const isLast = idx === custodyLog.length - 1;
                return (
                  <div key={e.id} className="relative pb-6">
                    {!isLast && <div className="absolute left-[-16px] top-6 bottom-0 w-px bg-white/10" />}
                    <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CIcon className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[12px] font-bold text-white">{e.action}</span>
                        <span className="text-[9px] font-mono text-gray-500">{e.evidenceId}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>Handler: <strong className="text-gray-300">{e.handler}</strong></span>
                        <span>{e.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(e.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
