'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PathologistCase, CaseResults } from '../types/pathologist.types';
import { useValidateReport } from '../hooks/usePathologistAnalytics';
import { LineChart, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeCase?: PathologistCase; results?: CaseResults; }

export function PathologistAnalysisPanel({ activeCase, results }: Props) {
  const { mutate: validate, isPending } = useValidateReport();
  const [notes, setNotes] = useState('');

  if (!activeCase || !results) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><LineChart className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Analysis & Validation</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 flex flex-col">
        {results.historicalComparisons && results.historicalComparisons.length > 0 && (
          <div className="mb-6">
            <h4 className="text-[11px] uppercase font-bold text-gray-500 tracking-widest mb-3">Historical Trends</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.historicalComparisons.map((comp, i) => (
                <div key={i} className="p-3 border border-white/5 rounded bg-surface-dark">
                  <div className="text-[12px] font-bold text-white mb-1">{comp.parameterName}</div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-gray-400">Previous: <span className="font-mono text-white">{comp.previousValue}</span></div>
                    <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded", 
                      comp.trend === 'Increasing' ? 'bg-emergency/20 text-emergency-light' : 
                      comp.trend === 'Decreasing' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                    )}>{comp.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <h4 className="text-[11px] uppercase font-bold text-gray-500 tracking-widest mb-3">Interpretation Notes</h4>
          <textarea
            className="w-full flex-1 bg-surface-dark border border-white/10 rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            placeholder="Enter clinical interpretation, differential diagnosis, and recommendations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => validate({ caseId: activeCase.id, notes })} disabled={isPending || !notes.trim()} className="bg-success hover:bg-success-light text-white font-bold" leftIcon={<CheckCircle2 className="w-4 h-4"/>}>
            Validate & Finalize Report
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
