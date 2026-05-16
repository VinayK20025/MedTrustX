'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ClaimDetails, ClaimPipelineStage } from '../types/claims.types';
import { Ban, AlertTriangle, FileText, Send, RotateCcw, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { claim?: ClaimDetails; }

const PIPELINE: ClaimPipelineStage[] = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Paid'];
const stageIndex = (s: ClaimPipelineStage) => { const i = PIPELINE.indexOf(s); return i >= 0 ? i : s === 'Rejected' ? -1 : 0; };
const stageDot = (current: number, idx: number) => idx <= current ? 'bg-amber-500 border-amber-400' : 'bg-white/5 border-white/10';

export function ClaimWorkspacePanel({ claim }: Props) {
  if (!claim) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex items-center justify-center">
      <p className="text-gray-500 text-[13px]">Select a claim to view workspace</p>
    </Card>
  );

  const ci = stageIndex(claim.stage);
  const isRejected = claim.stage === 'Rejected';
  const hasMissingDocs = claim.missingDocuments.length > 0;
  const isShortPayment = claim.stage === 'Paid' && claim.receivedAmount !== undefined && claim.receivedAmount < claim.expectedAmount;

  return (
    <Card className="border-amber-500/25 shadow-glass bg-[#110a04] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

      {/* Header & Pipeline */}
      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-[16px] font-bold text-white flex items-center gap-2">{claim.patientName}</h3>
            <span className="text-[11px] text-gray-500 font-mono mt-1 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-500" /> {claim.insurer} • {claim.policyNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block uppercase tracking-widest">Claim Amount</span>
            <span className="text-[16px] font-black font-mono text-white">₹{claim.claimAmount.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Visual Pipeline Tracker */}
        <div className="flex items-center gap-0 w-full px-2">
          {PIPELINE.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-1 relative">
                <div className={cn("w-3.5 h-3.5 rounded-full border-2 transition-all z-10 bg-[#110a04]", stageDot(ci, i))} />
                <span className={cn("text-[8.5px] font-mono mt-1.5 tracking-wider absolute top-4 whitespace-nowrap", i <= ci ? "text-amber-300 font-bold" : "text-gray-600")}>{s}</span>
              </div>
              {i < PIPELINE.length - 1 && <div className={cn("w-full h-[2px] -mx-4 -mt-5", i < ci ? "bg-amber-500" : "bg-white/10")} />}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto flex flex-col mt-4">
        <div className="flex-1 space-y-4">
          
          {/* Missing Docs Warning */}
          {hasMissingDocs && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-light shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[12px] font-bold text-warning-light uppercase tracking-widest">Missing Documents</h4>
                <p className="text-[11px] text-gray-300 mt-1 mb-2">Claim submission is blocked. The following are required:</p>
                <ul className="text-[11px] text-warning-light list-disc pl-4 marker:text-warning-500">
                  {claim.missingDocuments.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Rejection Details */}
          {isRejected && claim.rejectionReason && (
            <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-4 flex items-start gap-3">
              <Ban className="w-5 h-5 text-emergency-light shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[12px] font-bold text-emergency-light uppercase tracking-widest">Claim Rejected</h4>
                <p className="text-[12px] text-gray-300 mt-1">{claim.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Short Payment Alert */}
          {isShortPayment && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[12px] font-bold text-orange-400 uppercase tracking-widest">Short Payment Detected</h4>
                <p className="text-[11px] text-gray-300 mt-1">
                  Expected: ₹{claim.expectedAmount.toLocaleString()} | Received: ₹{claim.receivedAmount?.toLocaleString()} <br/>
                  Variance: <span className="font-bold text-orange-400">₹{(claim.expectedAmount - (claim.receivedAmount || 0)).toLocaleString()}</span>
                </p>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
             <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Financial Summary</h4>
             <div className="grid grid-cols-2 gap-y-3 text-[11px] font-mono">
               <div><span className="text-gray-500 block mb-0.5">Expected Amount</span><span className="text-white font-bold">₹{claim.expectedAmount.toLocaleString()}</span></div>
               <div><span className="text-gray-500 block mb-0.5">Aging</span><span className={cn(claim.agingDays > 30 ? "text-emergency-light font-bold" : claim.agingDays > 7 ? "text-amber-400 font-bold" : "text-white")}>{claim.agingDays} days</span></div>
               {claim.receivedAmount !== undefined && (
                 <div className="col-span-2 mt-2 pt-2 border-t border-white/5">
                   <span className="text-gray-500 inline-block w-24">Received:</span>
                   <span className="text-success-light font-bold text-[14px]">₹{claim.receivedAmount.toLocaleString()}</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/5 mt-4 flex gap-3">
          {claim.stage === 'Draft' ? (
             <Button disabled={hasMissingDocs} className={cn("flex-1 h-11 font-bold text-[13px]", hasMissingDocs ? "bg-gray-700 text-gray-500" : "bg-amber-600 hover:bg-amber-500 text-white")} leftIcon={<Send className="w-4 h-4" />}>Submit Claim</Button>
          ) : isRejected ? (
             <Button className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[13px]" leftIcon={<RotateCcw className="w-4 h-4" />}>Fix & Resubmit</Button>
          ) : (
             <Button className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[12px]" leftIcon={<FileText className="w-4 h-4" />}>View Documents</Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
