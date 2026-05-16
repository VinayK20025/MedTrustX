'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { InsuranceApproval } from '../types/caseManager.types';
import { useAppealInsurance } from '../hooks/useCaseManagerAnalytics';
import { ShieldAlert, CheckCircle2, ShieldQuestion } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { insurance?: InsuranceApproval; }

export function CaseManagerInsurancePanel({ insurance }: Props) {
  const { mutate: appeal, isPending } = useAppealInsurance();

  if (!insurance) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {insurance.status === 'Approved' ? <CheckCircle2 className="w-4 h-4 text-success-400" /> :
           insurance.status === 'Denied' ? <ShieldAlert className="w-4 h-4 text-emergency-400" /> :
           <ShieldQuestion className="w-4 h-4 text-warning-400" />}
          <h3 className="text-[13px] font-bold tracking-widest text-gray-300 uppercase">Insurance Authorization</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 flex flex-col justify-center">
        <div className="text-center mb-6">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">{insurance.payerName}</p>
          <h4 className="text-[18px] font-black text-white font-mono">{insurance.authNumber}</h4>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/20 rounded-lg p-3 border border-white/5 text-center">
             <span className="block text-[10px] text-gray-500 mb-1 uppercase">Days Auth</span>
             <span className="text-[16px] font-bold text-white font-mono">{insurance.daysApproved}</span>
          </div>
          <div className="bg-black/20 rounded-lg p-3 border border-white/5 text-center">
             <span className="block text-[10px] text-gray-500 mb-1 uppercase">Est Coverage</span>
             <span className="text-[16px] font-bold text-white font-mono">${insurance.estimatedCoverage.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-auto">
          {insurance.status === 'Denied' && (
            <Button 
              disabled={isPending}
              onClick={() => appeal(insurance.id)}
              className="w-full bg-emergency-600 hover:bg-emergency-500 text-white font-bold h-10"
            >
              INITIATE PAYER APPEAL
            </Button>
          )}
          {insurance.status === 'Pending' && (
            <div className="bg-warning/10 text-warning-light p-3 rounded text-[11px] font-bold text-center border border-warning/20">
              Authorization review in progress.
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
