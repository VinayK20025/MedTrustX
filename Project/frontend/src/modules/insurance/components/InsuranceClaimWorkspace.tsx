'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { InsuranceClaim, ClaimPipelineStage } from '../types/insurance.types';
import { useSubmitClaim, useResubmitClaim } from '../hooks/useInsuranceAnalytics';
import { FileText, Send, RotateCcw, AlertTriangle, Ban } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { claim?: InsuranceClaim; }

const PIPELINE: ClaimPipelineStage[] = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Paid'];
const stageIndex = (s: ClaimPipelineStage) => { const i = PIPELINE.indexOf(s); return i >= 0 ? i : s === 'Rejected' ? -1 : s === 'Appealed' ? 2 : 0; };

const stageDot = (current: number, idx: number) =>
  idx <= current ? 'bg-blue-500 border-blue-400' : 'bg-white/5 border-white/10';

export function InsuranceClaimWorkspace({ claim }: Props) {
  const { mutate: submit, isPending: isSubmitting } = useSubmitClaim();
  const { mutate: resubmit, isPending: isResubmitting } = useResubmitClaim();

  if (!claim) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex items-center justify-center">
      <p className="text-gray-500 text-[13px]">Select a claim to view workspace</p>
    </Card>
  );

  const ci = stageIndex(claim.stage);
  const isRejected = claim.stage === 'Rejected';
  const hasIssues = claim.validationIssues.length > 0;

  return (
    <Card className="border-blue-500/25 shadow-glass bg-[#040814] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

      {/* Header */}
      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[15px] font-bold text-white">{claim.patientName}</h3>
            <span className="text-[10px] text-gray-500 font-mono">{claim.mrn} • {claim.insurer} • {claim.policyNumber}</span>
          </div>
          <span className="text-[14px] font-black font-mono text-white">₹{claim.claimAmount.toLocaleString()}</span>
        </div>
        {/* Pipeline */}
        <div className="flex items-center gap-0">
          {PIPELINE.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={cn("w-4 h-4 rounded-full border-2 transition-all", stageDot(ci, i))} />
                <span className={cn("text-[8px] font-mono mt-1 tracking-wider", i <= ci ? "text-blue-300" : "text-gray-600")}>{s}</span>
              </div>
              {i < PIPELINE.length - 1 && <div className={cn("flex-1 h-0.5 mx-1", i < ci ? "bg-blue-500" : "bg-white/10")} />}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 space-y-5">
          {/* Validation Issues */}
          {hasIssues && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 space-y-2">
              <h4 className="text-[11px] font-bold text-warning-light uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Validation Issues</h4>
              {claim.validationIssues.map((issue, i) => (
                <div key={i} className="text-[12px] text-warning-light flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning-500 shrink-0" /> {issue}
                </div>
              ))}
            </div>
          )}

          {/* Rejection Reason */}
          {isRejected && claim.rejectionReason && (
            <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-emergency-light uppercase tracking-widest flex items-center gap-1.5 mb-1"><Ban className="w-3.5 h-3.5" /> Rejection Reason</h4>
              <p className="text-[12px] text-emergency-light">{claim.rejectionReason}</p>
            </div>
          )}

          {/* Claim Details */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3 text-[12px] font-mono">
            <div className="flex justify-between"><span className="text-gray-500">Claim Amount</span><span className="text-white font-bold">₹{claim.claimAmount.toLocaleString()}</span></div>
            {claim.approvedAmount !== undefined && <div className="flex justify-between"><span className="text-gray-500">Approved</span><span className="text-success-light font-bold">₹{claim.approvedAmount.toLocaleString()}</span></div>}
            {claim.receivedAmount !== undefined && claim.receivedAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">Received</span><span className="text-blue-300 font-bold">₹{claim.receivedAmount.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Insurer</span><span className="text-white">{claim.insurer}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Policy</span><span className="text-white">{claim.policyNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Aging</span><span className={cn(claim.agingDays > 7 ? "text-warning-light" : "text-gray-400")}>{claim.agingDays} days</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/5 mt-4 flex gap-3">
          {claim.stage === 'Draft' && (
            <Button disabled={hasIssues || isSubmitting} onClick={() => submit(claim.id)}
              className={cn("flex-1 h-11 font-bold text-[13px]", hasIssues ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white")}
              leftIcon={<Send className="w-4 h-4" />}>
              Submit Claim
            </Button>
          )}
          {isRejected && (
            <Button disabled={isResubmitting} onClick={() => resubmit(claim.id)}
              className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[13px]"
              leftIcon={<RotateCcw className="w-4 h-4" />}>
              Fix & Resubmit
            </Button>
          )}
          {(claim.stage !== 'Draft' && !isRejected) && (
            <div className="flex-1 h-11 bg-white/5 rounded-lg flex items-center justify-center text-[12px] text-gray-500">
              <FileText className="w-4 h-4 mr-2" /> {claim.stage === 'Paid' ? 'Claim settled' : 'Awaiting insurer response'}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
