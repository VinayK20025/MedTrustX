'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { EhrValidationError, EhrAuditLog } from '../types/ehr.types';
import { ShieldCheck, AlertOctagon, History, FileWarning } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { errors: EhrValidationError[]; logs?: EhrAuditLog[]; }

export function EhrValidationPanel({ errors, logs = [] }: Props) {
  const hasErrors = errors.length > 0;

  return (
    <Card className={cn("shadow-glass h-full flex flex-col", hasErrors ? "border-warning/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
          {hasErrors ? <AlertOctagon className="w-4 h-4 text-warning-light" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          <h3 className={cn("text-[13px] font-bold tracking-widest uppercase", hasErrors ? "text-warning-light" : "text-emerald-400")}>Data Integrity</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 flex flex-col">
        
        {/* Real-time Validation */}
        <div className="p-4 border-b border-white/5">
           <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-3"><FileWarning className="w-3 h-3" /> Active Form Validation</h4>
           {hasErrors ? (
             <div className="space-y-2">
               {errors.map(err => (
                 <div key={err.id} className={cn("p-2 rounded text-[11px] font-bold border", err.severity === 'Error' ? "bg-emergency/10 text-emergency-light border-emergency/20" : "bg-warning/10 text-warning-light border-warning/20")}>
                   [{err.field}] {err.message}
                 </div>
               ))}
             </div>
           ) : (
             <div className="bg-success/5 border border-success/10 rounded-lg p-3 text-center">
               <span className="text-[12px] font-bold text-success-light">No validation errors.</span>
               <p className="text-[10px] text-gray-500 mt-1">Record is compliant for submission.</p>
             </div>
           )}
        </div>

        {/* Audit Trail */}
        <div className="p-4 flex-1 flex flex-col overflow-hidden">
           <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-3"><History className="w-3 h-3" /> Audit Trail</h4>
           <div className="flex-1 overflow-y-auto space-y-3">
             {logs.length === 0 ? (
               <p className="text-[11px] text-gray-500 italic">No history available for this record.</p>
             ) : (
               logs.map(log => (
                 <div key={log.id} className="relative pl-4 border-l border-white/10 pb-2 last:border-transparent">
                   <div className="absolute w-2 h-2 rounded-full bg-blue-500 left-[-4.5px] top-1"></div>
                   <span className="text-[9px] text-gray-500 font-mono block mb-0.5">{new Date(log.timestamp).toLocaleString()}</span>
                   <p className="text-[12px] font-bold text-white">{log.action}</p>
                   <p className="text-[11px] text-blue-300">By: {log.user}</p>
                   <p className="text-[10px] text-gray-400 mt-0.5">{log.details}</p>
                 </div>
               ))
             )}
           </div>
        </div>

      </CardBody>
    </Card>
  );
}
