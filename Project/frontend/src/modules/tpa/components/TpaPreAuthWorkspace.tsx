'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TpaCase, TpaPipelineStage } from '../types/tpa.types';
import { ShieldCheck, AlertTriangle, FileText, UploadCloud, Ban, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tpaCase?: TpaCase; }

const PIPELINE: TpaPipelineStage[] = ['Request', 'Submitted', 'Under Review', 'Additional Info', 'Approved', 'Final Approval'];
const stageIndex = (s: TpaPipelineStage) => { const i = PIPELINE.indexOf(s); return i >= 0 ? i : s === 'Rejected' ? -1 : 0; };

const stageDot = (current: number, idx: number) =>
  idx <= current ? 'bg-blue-500 border-blue-400' : 'bg-white/5 border-white/10';

export function TpaPreAuthWorkspace({ tpaCase }: Props) {
  if (!tpaCase) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex items-center justify-center">
      <p className="text-gray-500 text-[13px]">Select a case from the queue</p>
    </Card>
  );

  const ci = stageIndex(tpaCase.stage);
  const isRejected = tpaCase.stage === 'Rejected';
  const blocksDischarge = tpaCase.dischargeBlocked && tpaCase.stage !== 'Final Approval';

  return (
    <Card className="border-blue-500/25 shadow-glass bg-[#040814] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

      {/* Header & Pipeline */}
      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
              {tpaCase.patientName}
              {tpaCase.priority === 'Emergency' && <span className="text-[9px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded-full uppercase tracking-wider">Emergency</span>}
            </h3>
            <span className="text-[11px] text-gray-500 font-mono mt-1 block">
              {tpaCase.mrn} • {tpaCase.insurer} {tpaCase.tpaName ? `(${tpaCase.tpaName})` : ''} • {tpaCase.policyNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block uppercase tracking-widest">Est. Cost</span>
            <span className="text-[16px] font-black font-mono text-white">₹{tpaCase.estimatedCost.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Visual Pipeline Tracker */}
        <div className="flex items-center gap-0 w-full px-2">
          {PIPELINE.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-1 relative">
                <div className={cn("w-3.5 h-3.5 rounded-full border-2 transition-all z-10 bg-[#040814]", stageDot(ci, i))} />
                <span className={cn("text-[8.5px] font-mono mt-1.5 tracking-wider absolute top-4 whitespace-nowrap", i <= ci ? "text-blue-300 font-bold" : "text-gray-600")}>{s}</span>
              </div>
              {i < PIPELINE.length - 1 && <div className={cn("w-full h-[2px] -mx-4 -mt-5", i < ci ? "bg-blue-500" : "bg-white/10")} />}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto flex flex-col mt-4">
        <div className="flex-1 space-y-4">
          
          {/* Discharge Blocker Warning */}
          {blocksDischarge && (
            <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-emergency-light shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[12px] font-bold text-emergency-light uppercase tracking-widest">Discharge Blocked</h4>
                <p className="text-[11px] text-gray-300 mt-1">Final approval is pending from {tpaCase.insurer}. Patient cannot be financially cleared for discharge.</p>
              </div>
            </div>
          )}

          {/* Rejection Details */}
          {isRejected && tpaCase.rejectionReason && (
            <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-emergency-light uppercase tracking-widest flex items-center gap-1.5 mb-1"><Ban className="w-3.5 h-3.5" /> Rejection Reason</h4>
              <p className="text-[12px] text-gray-300">{tpaCase.rejectionReason}</p>
            </div>
          )}

          {/* Request Form Summary */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
             <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Treatment Info</h4>
             <div className="grid grid-cols-2 gap-y-3 text-[11px] font-mono">
               <div><span className="text-gray-500 block mb-0.5">Request Type</span><span className="text-white font-bold">{tpaCase.type}</span></div>
               <div><span className="text-gray-500 block mb-0.5">Aging</span><span className={cn(tpaCase.agingHours > 24 ? "text-warning-light font-bold" : "text-white")}>{tpaCase.agingHours} hours</span></div>
               {tpaCase.approvedAmount !== undefined && (
                 <div className="col-span-2 mt-2 pt-2 border-t border-white/5">
                   <span className="text-gray-500 inline-block w-24">Approved:</span>
                   <span className="text-success-light font-bold text-[14px]">₹{tpaCase.approvedAmount.toLocaleString()}</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/5 mt-4 flex gap-3">
          <Button className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[12px]" leftIcon={<FileText className="w-4 h-4" />}>View Form</Button>
          <Button className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px]" leftIcon={<UploadCloud className="w-4 h-4" />}>Update TPA</Button>
        </div>
      </CardBody>
    </Card>
  );
}
