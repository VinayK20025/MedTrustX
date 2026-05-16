'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CodingData } from '../types/mro.types';
import { useAssignCode, useFinalizeCoding } from '../hooks/useMroAnalytics';
import { Hash, Plus, CheckCircle2, Stethoscope } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { coding?: CodingData; }

export function MroCodingPanel({ coding }: Props) {
  const { mutate: assign } = useAssignCode();
  const { mutate: finalize, isPending } = useFinalizeCoding();

  if (!coding) return null;

  const isComplete = coding.assignedICD.length > 0 && coding.assignedCPT.length > 0;

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#05060a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-indigo-400">CLINICAL CODING (ICD/CPT)</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Record: {coding.recordId}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col overflow-y-auto">
        {/* Clinical Context */}
        <div className="p-5 border-b border-white/[0.03]">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5"/> Physician Notes Context
          </h4>
          <div className="bg-white/[0.02] p-4 rounded-xl text-[12px] text-gray-300 leading-relaxed border border-white/5 font-mono">
            "{coding.clinicalNotes}"
          </div>
        </div>

        {/* AI Coding Suggestions */}
        <div className="p-5 flex-1 grid grid-cols-2 gap-6">
          {/* ICD Codes (Diagnoses) */}
          <div>
            <h4 className="text-[11px] font-bold text-sky-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">ICD-10 (Diagnoses)</h4>
            <div className="space-y-2">
              {coding.suggestedICDCodes.map(icd => {
                const assigned = coding.assignedICD.includes(icd.code);
                return (
                  <div key={icd.code} className={cn("p-3 rounded-lg border flex items-center justify-between transition-colors", 
                    assigned ? "bg-sky-500/10 border-sky-500/30" : "bg-surface-dark border-white/10"
                  )}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">{icd.code}</span>
                        <span className="text-[9px] text-success-light bg-success/10 px-1.5 py-0.5 rounded font-mono">{icd.confidence}% match</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{icd.description}</p>
                    </div>
                    {!assigned && (
                      <Button size="sm" onClick={() => assign({ codingId: coding.id, type: 'ICD', code: icd.code })} className="h-7 w-7 p-0 bg-white/5 hover:bg-white/10 text-gray-300"><Plus className="w-4 h-4"/></Button>
                    )}
                    {assigned && <CheckCircle2 className="w-5 h-5 text-sky-400"/>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CPT Codes (Procedures) */}
          <div>
            <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">CPT (Procedures)</h4>
            <div className="space-y-2">
              {coding.suggestedCPTCodes.map(cpt => {
                const assigned = coding.assignedCPT.includes(cpt.code);
                return (
                  <div key={cpt.code} className={cn("p-3 rounded-lg border flex items-center justify-between transition-colors", 
                    assigned ? "bg-emerald-500/10 border-emerald-500/30" : "bg-surface-dark border-white/10"
                  )}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">{cpt.code}</span>
                        <span className="text-[9px] text-success-light bg-success/10 px-1.5 py-0.5 rounded font-mono">{cpt.confidence}% match</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{cpt.description}</p>
                    </div>
                    {!assigned && (
                      <Button size="sm" onClick={() => assign({ codingId: coding.id, type: 'CPT', code: cpt.code })} className="h-7 w-7 p-0 bg-white/5 hover:bg-white/10 text-gray-300"><Plus className="w-4 h-4"/></Button>
                    )}
                    {assigned && <CheckCircle2 className="w-5 h-5 text-emerald-400"/>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
          <div className="text-[11px] text-gray-400 font-mono">
            {coding.assignedICD.length} ICD • {coding.assignedCPT.length} CPT Assigned
          </div>
          <Button 
            disabled={!isComplete || isPending} 
            onClick={() => finalize(coding.id)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-8"
          >
            FINALIZE CODING
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
