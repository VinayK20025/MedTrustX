'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DrugPreparationTask } from '../types/anesthesiaTech.types';
import { usePrepareDrug } from '../hooks/useAnesthesiaTechAnalytics';
import { Syringe, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { drugs: DrugPreparationTask[]; }

export function AnesthesiaDrugPanel({ drugs }: Props) {
  const { mutate: prepare, isPending } = usePrepareDrug();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><Syringe className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Anesthetic Drug Prep</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {drugs.map(drug => (
            <div key={drug.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className={cn("text-[14px] font-bold", drug.status === 'Prepared' ? 'text-gray-400' : 'text-white')}>{drug.drugName}</h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  drug.status === 'Prepared' ? 'bg-success/20 text-success-light' : 'bg-warning/20 text-warning-light animate-pulse'
                )}>
                  {drug.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">Dose: {drug.dosage}</span>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">Conc: {drug.concentration}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[9px]">
                <span className="text-gray-500 font-mono">Case: {drug.caseId}</span>
                {drug.status === 'Pending' ? (
                  <Button size="xs" onClick={() => prepare(drug.id)} disabled={isPending} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 border-none font-bold text-white">
                    Label & Prepare
                  </Button>
                ) : (
                  <span className="text-success-light flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3"/> By: {drug.preparedBy}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
