'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PreOpReview } from '../types/surgeon.types';
import { FileSearch, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { reviews: PreOpReview[]; }

export function SurgeonPreOpPanel({ reviews }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><FileSearch className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Pre-Op Clearances</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.03]">
          {reviews.map(rev => (
            <div key={rev.caseId} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-[13px] font-bold text-white font-mono">{rev.caseId}</h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  rev.clearanceStatus === 'Cleared' ? 'bg-success/20 text-success-light' : 'bg-warning/20 text-warning-light'
                )}>
                  {rev.clearanceStatus}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className={cn("p-2 rounded border text-center", rev.imagingAvailable ? "bg-success/5 border-success/20" : "bg-emergency/5 border-emergency/20")}>
                   <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Imaging</span>
                   {rev.imagingAvailable ? <CheckCircle2 className="w-4 h-4 text-success-light mx-auto"/> : <AlertCircle className="w-4 h-4 text-emergency-light mx-auto"/>}
                </div>
                <div className={cn("p-2 rounded border text-center", rev.labsReviewed ? "bg-success/5 border-success/20" : "bg-emergency/5 border-emergency/20")}>
                   <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Labs</span>
                   {rev.labsReviewed ? <CheckCircle2 className="w-4 h-4 text-success-light mx-auto"/> : <AlertCircle className="w-4 h-4 text-emergency-light mx-auto"/>}
                </div>
                <div className={cn("p-2 rounded border text-center", rev.bloodMatched ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20")}>
                   <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Blood Match</span>
                   {rev.bloodMatched ? <CheckCircle2 className="w-4 h-4 text-success-light mx-auto"/> : <AlertCircle className="w-4 h-4 text-warning-light mx-auto"/>}
                </div>
              </div>

              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <p className="text-[10px] text-gray-400"><span className="text-indigo-300 font-bold">Dx:</span> {rev.diagnosis}</p>
                <p className="text-[10px] text-gray-400 mt-1"><span className="text-indigo-300 font-bold">Plan:</span> {rev.surgicalPlan}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
