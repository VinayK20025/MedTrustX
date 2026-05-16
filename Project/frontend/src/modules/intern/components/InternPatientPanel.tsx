'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InternPatient } from '../types/intern.types';
import { Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { patients: InternPatient[]; }

export function InternPatientPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Assigned Observations</h3>
        </div>
        <span className="text-xs text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Read Only
        </span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {patients.map(p => (
          <div key={p.id} className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{p.patientName}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">{p.status}</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-2 truncate">{p.diagnosis}</p>
            <div className="flex justify-end">
              <Button size="sm" className="h-6 px-2 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center gap-1">
                <Eye className="w-3 h-3" /> View Chart
              </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
