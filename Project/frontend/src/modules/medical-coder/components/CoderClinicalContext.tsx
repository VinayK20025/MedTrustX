'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ClinicalContext } from '../types/coder.types';
import { Stethoscope, User, Calendar } from 'lucide-react';

interface Props { context?: ClinicalContext; }

export function CoderClinicalContext({ context }: Props) {
  if (!context) return null;

  // Simple highlight function
  const renderHighlightedText = (text: string) => {
    let result = text;
    context.nlpHighlights.forEach(hl => {
      const colorClass = hl.type === 'diagnosis' ? 'bg-blue-500/20 text-blue-300' : 
                         hl.type === 'procedure' ? 'bg-purple-500/20 text-purple-300' : 'bg-success/20 text-success-light';
      result = result.replace(new RegExp(hl.text, 'g'), `<span class="${colorClass} px-1 rounded cursor-help" title="NLP Match: ${hl.type}">${hl.text}</span>`);
    });
    return <div dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-[#080b14] h-full flex flex-col relative overflow-hidden">
      <CardHeader className="border-b border-white/[0.04] p-0 flex flex-col">
        <div className="bg-blue-500/10 px-5 py-3 flex items-center justify-between border-b border-blue-500/20">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-white font-bold text-[14px]"><User className="w-4 h-4 text-blue-400"/> {context.patientHeader.name}</div>
             <span className="text-[11px] text-gray-400 font-mono border-l border-white/10 pl-4">{context.patientHeader.mrn}</span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
             <Calendar className="w-3.5 h-3.5"/> Admit: {new Date(context.patientHeader.admitDate).toLocaleDateString()}
          </div>
        </div>
        <div className="px-5 py-2 flex gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/[0.02] bg-black/20">
           <span className="text-blue-400 border-b-2 border-blue-400 pb-2 -mb-2">Clinical Notes</span>
           <span className="hover:text-gray-300 cursor-pointer">Labs</span>
           <span className="hover:text-gray-300 cursor-pointer">Imaging</span>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto space-y-6 text-[13px] text-gray-300 leading-relaxed font-mono">
        <div>
           <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Stethoscope className="w-3.5 h-3.5"/> HPI</h4>
           <div className="bg-white/[0.02] p-3 rounded border border-white/5">{renderHighlightedText(context.notes.hpi)}</div>
        </div>
        <div>
           <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">DIAGNOSIS</h4>
           <div className="bg-white/[0.02] p-3 rounded border border-white/5">{renderHighlightedText(context.notes.diagnosis)}</div>
        </div>
        <div>
           <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">PROCEDURES</h4>
           <div className="bg-white/[0.02] p-3 rounded border border-white/5">{renderHighlightedText(context.notes.procedures)}</div>
        </div>
      </CardBody>
    </Card>
  );
}
