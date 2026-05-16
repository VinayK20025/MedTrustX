'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AssignedPatient } from '../types/locum.types';
import { Users, AlertTriangle } from 'lucide-react';

interface Props { patients: AssignedPatient[]; }

const riskStyle: Record<string, string> = {
  stable: 'border-success/30 text-success-light',
  watch: 'border-warning/50 text-warning-light bg-warning/5',
  critical: 'border-emergency/50 text-emergency-light bg-emergency/10 animate-pulse',
};

export function AssignedPatientsPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Shift Roster</h3>
          <p className="text-xs text-gray-400 mt-0.5">{patients.length} patients assigned</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[500px]">
        {patients.map(p => (
          <div key={p.id} className={`p-3 rounded-lg border cursor-pointer hover:border-indigo-500/50 transition-colors ${riskStyle[p.riskFlag]} ${p.riskFlag === 'stable' ? 'bg-white/[0.02]' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{p.patientName} <span className="text-[10px] text-gray-500 font-normal">({p.age}{p.gender})</span></span>
              <span className="text-[10px] text-gray-400 font-mono bg-black/20 px-1.5 py-0.5 rounded">{p.ward} {p.bed}</span>
            </div>
            <p className="text-xs text-gray-300 mb-2 truncate">{p.diagnosis}</p>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500">Updated: {p.lastUpdate}</span>
              {p.handoverPending && <span className="text-warning-light font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Handover Pending</span>}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
