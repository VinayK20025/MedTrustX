'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { EthicsCase, CaseDetail, EthicsDocument } from '../types/ethics.types';
import { useSubmitEthicsDecision } from '../hooks/useEthicsAnalytics';
import { Scale, Lock, FileText, CheckCircle2, XCircle, Users, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { ethicsCase?: EthicsCase; details?: CaseDetail; documents: EthicsDocument[]; }

export function EthicsReviewWorkspace({ ethicsCase, details, documents }: Props) {
  const { mutate: submitDecision } = useSubmitEthicsDecision();

  if (!ethicsCase || !details) {
    return (
      <Card className="border-emerald-500/20 shadow-glass bg-[#020504] h-full flex items-center justify-center">
        <div className="text-center opacity-40">
          <Scale className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select an ethics case or protocol to begin review.</p>
        </div>
      </Card>
    );
  }

  const caseDocs = documents.filter(d => d.caseId === ethicsCase.id);

  return (
    <Card className="border-emerald-500/20 shadow-glass bg-[#020504] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-800 to-teal-500" />

      <CardHeader className="border-b border-white/[0.04] p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{ethicsCase.id} • {ethicsCase.type}</span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 uppercase flex items-center gap-1"><Lock className="w-3 h-3" /> Confidential Case File</span>
        </div>
        <h3 className="text-[22px] font-black text-white leading-tight">{ethicsCase.title}</h3>
        <p className="text-[11px] text-gray-400 mt-2">Submitted by: <span className="text-gray-300 font-semibold">{ethicsCase.submittedBy}</span> • {ethicsCase.department}</p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Background */}
          <div>
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Clinical Background</h4>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-[13px] text-gray-300 leading-relaxed font-medium">
              {details.background}
            </div>
          </div>

          {/* Ethical Questions */}
          <div>
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-emerald-400" /> Core Ethical Questions</h4>
            <div className="space-y-2">
              {details.ethicalQuestions.map((q, idx) => (
                <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-[13px] font-semibold text-emerald-200">
                  {idx + 1}. {q}
                </div>
              ))}
            </div>
          </div>

          {/* Stakeholders & Docs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Stakeholders</h4>
              <ul className="space-y-1">
                {details.stakeholders.map((s, i) => <li key={i} className="text-[12px] text-gray-300 bg-black/30 p-2 rounded border border-white/5">{s}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> Attached Documents</h4>
              <div className="space-y-2">
                {caseDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 p-2 rounded">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] text-white truncate">{doc.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decision Panel */}
        <div className="p-6 bg-black/40 border-t border-white/[0.04]">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Committee Decision</p>
          <div className="flex gap-3">
            <Button className="flex-1 h-12 bg-success/20 hover:bg-success/30 text-success-light border border-success/40" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Concur / Approve</Button>
            <Button className="flex-1 h-12 bg-emergency/20 hover:bg-emergency/30 text-emergency-light border border-emergency/40" leftIcon={<XCircle className="w-4 h-4" />}>Dissent / Reject</Button>
            <Button className="flex-1 h-12 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40">Request Clarification</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
