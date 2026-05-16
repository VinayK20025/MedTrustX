'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PatientReviewData } from '../types/clinicalPharmacy.types';
import { Users, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: PatientReviewData[]; }

export function ClinicalPharmacyPatientList({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Users className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Patient Review Queue</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {patients.map(p => (
            <div key={p.id} className={cn("p-5 transition-colors cursor-pointer", p.riskLevel === 'Critical' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {p.patientName}
                    {p.riskLevel === 'Critical' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-mono">
                    {p.mrn} <span>•</span> {p.ward}
                  </p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  p.riskLevel === 'Critical' ? 'bg-emergency/20 text-emergency-light' : 
                  p.riskLevel === 'High' ? 'bg-warning/20 text-warning-light' : 'bg-blue-500/20 text-blue-400'
                )}>
                  {p.riskLevel} Risk
                </span>
              </div>
              
              <p className="text-[11px] text-gray-400 line-clamp-1 mt-2">{p.diagnosis}</p>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-2">
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                     p.status === 'Intervention Required' ? 'text-emergency-400 border-emergency-500/30 bg-emergency-500/10' : 
                     p.status === 'Needs Review' ? 'text-warning-400 border-warning-500/30 bg-warning-500/10' : 'text-gray-400 border-white/5'
                  )}>{p.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
