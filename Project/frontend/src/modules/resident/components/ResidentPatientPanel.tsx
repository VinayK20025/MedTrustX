'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ResidentPatient } from '../types/resident.types';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { patients: ResidentPatient[]; }

const statusStyle: Record<string, string> = {
  critical: 'border-emergency/30 bg-emergency/10 text-emergency-light',
  stable: 'border-white/[0.04] bg-white/[0.02] text-gray-300',
  discharge_ready: 'border-success/30 bg-success/10 text-success-light',
};

export function ResidentPatientPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">My Patients</h3>
        </div>
        <span className="text-xs text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5 font-mono">
          Ward: Gen Med
        </span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {patients.map(p => (
          <div key={p.id} className={`p-3 rounded-lg border ${statusStyle[p.status]}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{p.patientName}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">{p.status.replace('_', ' ')}</span>
            </div>
            <p className="text-[11px] opacity-80 mb-2 truncate">{p.diagnosis}</p>
            <div className="flex justify-between items-center text-[10px]">
              <span className="opacity-60 font-mono">Bed: {p.bed}</span>
              <div className="flex gap-2">
                <Button size="sm" className="h-6 px-2 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white border-none">Chart</Button>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
