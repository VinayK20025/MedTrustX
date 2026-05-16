'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CultureSample, ASTResult } from '../types/microbiology.types';
import { useFinalizeAst } from '../hooks/useMicrobiologyAnalytics';
import { Pill, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeSample?: CultureSample; astResults: ASTResult[]; }

export function MicrobiologyASTPanel({ activeSample, astResults }: Props) {
  const { mutate: finalize, isPending } = useFinalizeAst();

  if (!activeSample) return null;

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">ANTIMICROBIAL SUSCEPTIBILITY (AST)</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {astResults.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-[12px] font-bold">AST pending.</div>
        ) : (
          <>
            <table className="w-full text-left border-collapse flex-1">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-gray-500 bg-black/40">
                  <th className="p-3 font-medium">ANTIBIOTIC</th>
                  <th className="p-3 font-medium">CLASS</th>
                  <th className="p-3 font-medium text-right">MIC</th>
                  <th className="p-3 font-medium">INTERPRETATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[12px] text-gray-300 font-bold">
                {astResults.map(r => (
                  <tr key={r.id} className={cn("hover:bg-white/5 transition-colors", 
                    r.interpretation === 'Resistant' ? 'bg-emergency/5 border-l-2 border-emergency text-emergency-light' : 
                    r.interpretation === 'Sensitive' ? 'text-success-light' : 'text-warning-light'
                  )}>
                    <td className="p-3">{r.antibiotic}</td>
                    <td className="p-3 text-gray-500 font-normal">{r.class}</td>
                    <td className="p-3 text-right text-[14px]">{r.mic}</td>
                    <td className="p-3">
                      <span className={cn('px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider', 
                        r.interpretation === 'Resistant' ? 'bg-emergency/20 text-emergency-light' : 
                        r.interpretation === 'Sensitive' ? 'bg-success/20 text-success-light' : 'bg-warning/20 text-warning-light'
                      )}>{r.interpretation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
              <Button size="sm" onClick={() => finalize(activeSample.id)} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold" leftIcon={<CheckCircle2 className="w-4 h-4"/>}>
                Finalize AST Report
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
