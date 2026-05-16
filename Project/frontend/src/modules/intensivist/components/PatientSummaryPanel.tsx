'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ActivePatientDetails } from '../types/intensivist.types';
import { User, Activity } from 'lucide-react';

interface Props { details: ActivePatientDetails | null; }

export function PatientSummaryPanel({ details: d }: Props) {
  if (!d) return null;
  const c = d.caseInfo;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
            {c.patientName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">{c.patientName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{c.age} yrs • {c.gender} • {c.unit}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Risk Score</p>
          <p className="text-xl font-black text-emergency-light">{c.riskScore}</p>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex-1 space-y-5">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3.5 h-3.5"/> Clinical History</h4>
          <p className="text-sm text-gray-200 bg-white/[0.02] p-3 rounded-lg border border-white/[0.04] leading-relaxed">{d.history}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Current Interventions</h4>
          <div className="flex flex-wrap gap-2">
            {d.currentMeds.map((m, i) => (
              <span key={i} className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div>
           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Key Issue</h4>
           <div className="text-sm text-emergency-light bg-emergency/10 border border-emergency/20 p-3 rounded-lg font-bold">
             {c.keyIssue}
           </div>
        </div>
      </CardBody>
    </Card>
  );
}
