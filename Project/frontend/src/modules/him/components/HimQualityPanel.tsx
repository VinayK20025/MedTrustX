'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DataQualityMetric } from '../types/him.types';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { metrics: DataQualityMetric[]; }

export function HimQualityPanel({ metrics }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/15"><Activity className="w-4 h-4 text-sky-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Data Quality by Department</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {metrics.map(m => (
            <div key={m.department} className={cn("p-5 transition-colors cursor-pointer", m.status === 'Critical' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                  {m.department}
                  {m.status === 'Critical' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  {m.status === 'Healthy' && <ShieldCheck className="w-4 h-4 text-success-light" />}
                </h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  m.status === 'Critical' ? 'bg-emergency/20 text-emergency-light' : 
                  m.status === 'At Risk' ? 'bg-warning/20 text-warning-light' : 'bg-success/20 text-success-light'
                )}>
                  {m.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                   <div className="flex justify-between text-[11px] mb-1"><span className="text-gray-400">Completeness</span><span className="text-white font-mono">{m.completenessScore}%</span></div>
                   <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                     <div className={cn("h-full", m.completenessScore > 90 ? "bg-success-500" : m.completenessScore > 80 ? "bg-warning-500" : "bg-emergency-500")} style={{ width: `${m.completenessScore}%` }} />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-[11px] mb-1"><span className="text-gray-400">Accuracy</span><span className="text-white font-mono">{m.accuracyScore}%</span></div>
                   <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                     <div className={cn("h-full", m.accuracyScore > 95 ? "bg-success-500" : m.accuracyScore > 90 ? "bg-warning-500" : "bg-emergency-500")} style={{ width: `${m.accuracyScore}%` }} />
                   </div>
                </div>
              </div>

              <div className="flex gap-4 text-[11px] text-gray-500 font-mono border-t border-white/[0.04] pt-3 mt-3">
                 <span>Missing Sigs: <span className={m.missingSignatures > 10 ? "text-emergency-light" : "text-white"}>{m.missingSignatures}</span></span>
                 <span>Uncoded: <span className={m.uncodedRecords > 20 ? "text-warning-light" : "text-white"}>{m.uncodedRecords}</span></span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
