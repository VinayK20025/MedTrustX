'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ActiveCodingState, NlpSuggestion } from '../types/coder.types';
import { useAddCode, useSubmitChart } from '../hooks/useCoderAnalytics';
import { Code2, Search, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { active?: ActiveCodingState; suggestions: NlpSuggestion[]; }

export function CoderWorkspacePanel({ active, suggestions }: Props) {
  const { mutate: addCode } = useAddCode();
  const { mutate: submit, isPending } = useSubmitChart();

  if (!active) return null;

  return (
    <Card className="border-blue-500/30 shadow-glass bg-[#030612] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-[13px] font-bold tracking-widest text-blue-400">CODING WORKSPACE</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500">Case: {active.caseId}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search ICD-10 or CPT codes (e.g. 'STEMI', 'I21.9')..." 
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[12px] text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col overflow-y-auto">
        
        {/* Validation Errors */}
        {active.validationErrors.length > 0 && (
          <div className="mx-5 mt-4 p-3 bg-emergency/10 border border-emergency/30 rounded-lg flex items-start gap-2 text-emergency-light text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>
               <span className="font-bold block mb-0.5">Validation Errors Detected:</span>
               <ul className="list-disc list-inside">
                 {active.validationErrors.map((err, i) => <li key={i}>{err}</li>)}
               </ul>
            </div>
          </div>
        )}

        {/* Selected Codes */}
        <div className="p-5">
           <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Selected Codes</h4>
           <div className="space-y-2">
             {active.selectedICD.map(icd => (
               <div key={icd.code} className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded flex justify-between items-center group">
                 <div>
                    <span className="text-[11px] font-mono font-bold text-white bg-blue-500/20 px-1.5 py-0.5 rounded mr-2">{icd.code}</span>
                    <span className="text-[11px] text-gray-300">{icd.description}</span>
                 </div>
                 {icd.primary && <span className="text-[9px] uppercase font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Primary DX</span>}
               </div>
             ))}
             {active.selectedCPT.length === 0 && (
                <div className="p-3 border border-dashed border-white/10 rounded text-center text-[11px] text-gray-600">
                  No CPT codes selected.
                </div>
             )}
           </div>
        </div>

        {/* NLP Suggestions */}
        <div className="p-5 border-t border-white/[0.04] bg-black/20 flex-1">
           <h4 className="text-[11px] font-bold text-success-light uppercase tracking-widest mb-3 flex items-center gap-1">
             AI Suggestions
           </h4>
           <div className="space-y-2">
             {suggestions.map(sug => {
                const isSelected = active.selectedICD.some(c => c.code === sug.code) || active.selectedCPT.some(c => c.code === sug.code);
                if (isSelected) return null;
                return (
                  <div key={sug.code} className="p-2.5 bg-surface-dark border border-white/5 rounded flex justify-between items-center hover:border-white/20 transition-colors">
                     <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded", sug.type === 'ICD-10' ? "text-blue-300 bg-blue-500/20" : "text-purple-300 bg-purple-500/20")}>{sug.code}</span>
                          <span className="text-[9px] text-success-light bg-success/10 px-1.5 py-0.5 rounded font-mono">{sug.confidence}% Match</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">{sug.description}</p>
                     </div>
                     <Button size="sm" onClick={() => addCode({ caseId: active.caseId, type: sug.type, code: sug.code })} className="h-7 w-7 p-0 bg-white/5 hover:bg-white/10 text-gray-300 shrink-0"><Plus className="w-4 h-4"/></Button>
                  </div>
                );
             })}
           </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center mt-auto">
          <div className="text-[11px] text-gray-400 font-mono">
            Ctrl+S to Submit
          </div>
          <Button 
            disabled={active.validationErrors.length > 0 || isPending} 
            onClick={() => submit(active.caseId)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-8"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            SUBMIT CHART
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
