'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TranscriptionTemplate, TranscriptionSnippet } from '../types/transcription.types';
import { FileCode, Keyboard, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { templates: TranscriptionTemplate[]; snippets: TranscriptionSnippet[]; qaFlags: string[]; }

export function TranscriptionToolsPanel({ templates, snippets, qaFlags }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-[#05060a] h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
         <h3 className="text-[13px] font-bold tracking-widest text-gray-300">TOOLS & QA</h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        
        {/* QA Flags */}
        {qaFlags.length > 0 && (
          <div className="p-4 border-b border-white/[0.04] bg-warning/5">
            <h4 className="text-[11px] font-bold text-warning-light uppercase tracking-widest mb-3 flex items-center gap-1">
               <AlertOctagon className="w-3.5 h-3.5"/> Quality Flags
            </h4>
            <div className="space-y-2">
              {qaFlags.map((flag, i) => (
                <div key={i} className="text-[11px] text-warning-200 bg-warning/10 border border-warning/20 p-2 rounded">
                  {flag}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        <div className="p-4 border-b border-white/[0.04]">
           <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <FileCode className="w-3.5 h-3.5"/> Document Templates
           </h4>
           <div className="space-y-2">
             {templates.map(tpl => (
               <div key={tpl.id} className="p-2.5 bg-surface-dark border border-white/5 rounded flex justify-between items-center hover:border-white/20 transition-colors cursor-pointer group">
                  <div>
                     <h5 className="text-[12px] font-bold text-white mb-0.5">{tpl.name}</h5>
                     <span className="text-[9px] text-gray-500 font-mono">{tpl.type}</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Insert</span>
               </div>
             ))}
           </div>
        </div>

        {/* Snippets / Macros */}
        <div className="p-4">
           <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Keyboard className="w-3.5 h-3.5"/> Text Macros
           </h4>
           <div className="grid grid-cols-1 gap-2">
             {snippets.map(snip => (
               <div key={snip.id} className="p-2 bg-black/40 border border-white/5 rounded flex items-center gap-3">
                  <span className="text-[11px] font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded min-w-[32px] text-center">{snip.shortcut}</span>
                  <span className="text-[11px] text-gray-400 truncate">{snip.expansion}</span>
               </div>
             ))}
           </div>
        </div>

      </CardBody>
    </Card>
  );
}
