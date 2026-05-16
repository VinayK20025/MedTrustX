'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PostOpNote } from '../types/surgeon.types';
import { useSignPostOpNote } from '../hooks/useSurgeonAnalytics';
import { FileSignature, ShieldCheck, Mic } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { notes: PostOpNote[]; }

export function SurgeonNotesPanel({ notes }: Props) {
  const { mutate: sign, isPending } = useSignPostOpNote();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><FileSignature className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Operative Notes</h3>
        </div>
        <Button size="sm" variant="ghost" leftIcon={<Mic className="w-3 h-3" />} className="text-gray-400 hover:text-white">
          Dictate
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {notes.map(note => (
            <div key={note.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{note.procedurePerformed}</h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">{note.caseId} | {new Date(note.date).toLocaleDateString()}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  note.status === 'Draft' ? 'bg-warning/20 text-warning-light' : 'bg-success/20 text-success-light'
                )}>
                  {note.status}
                </span>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3 space-y-2">
                <p className="text-[10px] text-gray-400"><span className="text-emerald-300 font-bold">Post-Op Dx:</span> {note.postOpDiagnosis}</p>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Operative Findings</span>
                  <p className="text-[10px] text-gray-300">{note.findings}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {note.status === 'Draft' ? (
                  <Button size="xs" onClick={() => sign(note.id)} disabled={isPending} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 border-none font-bold" leftIcon={<ShieldCheck className="w-3 h-3" />}>
                    Sign Note
                  </Button>
                ) : (
                  <span className="text-[10px] text-success-light flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Signed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
