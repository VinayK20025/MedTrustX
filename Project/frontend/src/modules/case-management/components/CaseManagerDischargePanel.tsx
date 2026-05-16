'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DischargePlan } from '../types/caseManager.types';
import { useUpdateDischargeClearance } from '../hooks/useCaseManagerAnalytics';
import { LogOut, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { plan?: DischargePlan; }

export function CaseManagerDischargePanel({ plan }: Props) {
  const { mutate: updateClearance } = useUpdateDischargeClearance();

  if (!plan) return null;

  return (
    <Card className="border-sky-500/30 shadow-glass bg-[#03060a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogOut className="w-4 h-4 text-sky-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-sky-400">DISCHARGE PLANNING</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Case: {plan.caseId}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
           <div>
              <span className="block text-gray-500 text-[10px] mb-1 uppercase">Post-Acute Care</span>
              <span className="text-white font-bold text-[13px]">{plan.postAcuteCare}</span>
           </div>
           <div className="text-right">
              <span className="block text-gray-500 text-[10px] mb-1 uppercase">Target Date</span>
              <span className="text-sky-400 font-bold text-[13px] font-mono">{new Date(plan.targetDate).toLocaleDateString()}</span>
           </div>
        </div>

        {/* Readiness Meter */}
        <div className="px-6 py-4 border-b border-white/[0.03]">
          <div className="flex justify-between text-[11px] mb-2 font-bold">
            <span className="text-gray-400">Readiness Score</span>
            <span className={plan.readinessScore === 100 ? "text-success-light" : "text-sky-400"}>{plan.readinessScore}%</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-500", plan.readinessScore === 100 ? "bg-success-500" : "bg-sky-500")} style={{ width: `${plan.readinessScore}%` }} />
          </div>
        </div>

        {/* Clearance Checklist */}
        <div className="divide-y divide-white/[0.03] flex-1 overflow-y-auto p-4 space-y-2">
          {[
            { key: 'clinicalClearance', label: 'Clinical Clearance (Physician)', value: plan.clinicalClearance },
            { key: 'medicationReconciliation', label: 'Medication Reconciliation (Pharmacy)', value: plan.medicationReconciliation },
            { key: 'billingClearance', label: 'Financial/Billing Clearance', value: plan.billingClearance },
          ].map(item => (
            <div key={item.key} className={cn("p-4 rounded-xl border flex items-center justify-between transition-colors", 
                item.value ? "bg-success/10 border-success/30" : "bg-surface-dark border-white/10"
            )}>
              <div className="flex items-center gap-3">
                {item.value ? <CheckCircle2 className="w-5 h-5 text-success-light"/> : <Circle className="w-5 h-5 text-gray-600"/>}
                <h4 className={cn("text-[13px] font-bold", item.value ? "text-white" : "text-gray-400")}>{item.label}</h4>
              </div>
              
              {!item.value && (
                <Button size="sm" 
                  onClick={() => updateClearance({ caseId: plan.caseId, type: item.key, value: true })}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] h-7"
                >
                  Request Clearance
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {/* Action Bar */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
          {!plan.billingClearance && (
            <div className="flex items-center gap-2 text-warning-light text-[11px] font-bold">
              <AlertCircle className="w-4 h-4"/> Discharge blocked by pending clearances.
            </div>
          )}
          <Button 
            disabled={plan.readinessScore < 100} 
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-10 px-8 ml-auto"
          >
            AUTHORIZE DISCHARGE
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
