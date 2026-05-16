'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DischargeBillingSummary, DischargeDocument } from '../types/discharge.types';
import { CreditCard, FileText, CheckCircle2, AlertTriangle, FileWarning } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { billing?: DischargeBillingSummary; documents: DischargeDocument[]; }

export function DischargeStatusPanel({ billing, documents }: Props) {
  const missingDocs = documents.filter(d => d.status === 'Missing').length;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Billing Clearance */}
      <Card className={cn("shadow-glass flex-1 flex flex-col", billing?.status === 'Cleared' ? "border-success/20" : "border-emergency/25 bg-emergency/[0.02]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <CreditCard className={cn("w-3.5 h-3.5", billing?.status === 'Cleared' ? "text-success-light" : "text-emergency-light")} />
          <h3 className={cn("text-[12px] font-bold tracking-widest", billing?.status === 'Cleared' ? "text-success-light" : "text-emergency-light")}>BILLING CLEARANCE</h3>
        </CardHeader>
        <CardBody className="p-4 flex-1">
          {billing ? (
            <div className="space-y-3 text-[12px] font-mono">
              <div className="flex justify-between"><span className="text-gray-500">Total Charges</span><span className="text-white font-bold">₹{billing.totalCharges.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="text-success-light">-₹{billing.insuranceCovered.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Patient Paid</span><span className="text-white">₹{billing.patientPaid.toLocaleString()}</span></div>
              <div className="border-t border-white/5 pt-3 flex justify-between">
                <span className="text-gray-400 font-bold">Outstanding</span>
                <span className={cn("font-bold text-[14px]", billing.outstanding > 0 ? "text-emergency-light" : "text-success-light")}>
                  ₹{billing.outstanding.toLocaleString()}
                </span>
              </div>
              {billing.outstanding > 0 && (
                <div className="text-[10px] text-emergency-light bg-emergency/10 border border-emergency/20 p-2 rounded flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> Cannot clear billing with outstanding balance.
                </div>
              )}
            </div>
          ) : <p className="text-gray-500 text-[11px]">No billing data</p>}
        </CardBody>
      </Card>

      {/* Documents */}
      <Card className={cn("shadow-glass flex-1 flex flex-col", missingDocs > 0 ? "border-warning/25" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-[12px] font-bold tracking-widest text-blue-400">DOCUMENTS</h3>
          </div>
          {missingDocs > 0 && <span className="text-[9px] bg-warning/20 text-warning-light px-2 py-0.5 rounded font-bold">{missingDocs} Missing</span>}
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {documents.map(doc => (
              <div key={doc.id} className={cn("p-3 flex items-center justify-between", doc.status === 'Missing' && "bg-warning/[0.03]")}>
                <div className="flex items-center gap-2">
                  {doc.status === 'Ready' ? <CheckCircle2 className="w-4 h-4 text-success-light" /> : <FileWarning className="w-4 h-4 text-warning-light" />}
                  <div>
                    <span className="text-[12px] font-bold text-white block">{doc.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{doc.type}</span>
                  </div>
                </div>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                  doc.status === 'Ready' ? 'bg-success/20 text-success-light' :
                  doc.status === 'Missing' ? 'bg-warning/20 text-warning-light' : 'bg-gray-500/20 text-gray-300'
                )}>{doc.status}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
