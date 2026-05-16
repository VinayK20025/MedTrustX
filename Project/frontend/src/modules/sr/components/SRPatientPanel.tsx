'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SRPatient } from '../types/sr.types';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { patients: SRPatient[]; }

const statusStyle: Record<string, string> = {
  critical: 'border-emergency/30 bg-emergency/10 text-emergency-light',
  watch: 'border-warning/30 bg-warning/10 text-warning-light',
  stable: 'border-white/[0.04] bg-white/[0.02] text-gray-300',
};

export function SRPatientPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Ward Patients</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {patients.map(p => (
          <div key={p.id} className={`p-3 rounded-lg border ${statusStyle[p.status]}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{p.patientName}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">{p.status}</span>
            </div>
            <p className="text-[11px] opacity-80 mb-2 truncate">{p.diagnosis}</p>
            <div className="flex justify-between items-center text-[10px]">
              <span className="opacity-60 font-mono">{p.ward} | Bed: {p.bed}</span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
