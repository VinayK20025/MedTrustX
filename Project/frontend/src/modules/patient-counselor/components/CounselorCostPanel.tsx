'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { FinancialEstimate } from '../types/patientCounselor.types';
import { Calculator, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { estimate?: FinancialEstimate; }

export function CounselorCostPanel({ estimate }: Props) {
  if (!estimate) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">FINANCIAL ESTIMATE</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 flex flex-col">
        <div className="text-center mb-6">
          <p className="text-[11px] text-gray-400 mb-1">{estimate.procedureName}</p>
          <h4 className="text-[24px] font-black text-white font-mono">
             ${estimate.patientOut_of_Pocket.toLocaleString()}
          </h4>
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Estimated Out-of-Pocket</span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[12px] p-2 bg-black/20 rounded">
            <span className="text-gray-400">Gross Hospital Cost</span>
            <span className="font-mono text-white">${estimate.grossCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[12px] p-2 bg-black/20 rounded border border-success/20">
            <span className="text-gray-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-success-light"/> Est. Insurance Cov.</span>
            <span className="font-mono text-success-light">-${estimate.insuranceCoverage.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-auto">
          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Available Payment Plans</h5>
          <ul className="space-y-2">
            {estimate.paymentOptions.map((opt, idx) => (
              <li key={idx} className="text-[11px] text-gray-300 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {opt}
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
