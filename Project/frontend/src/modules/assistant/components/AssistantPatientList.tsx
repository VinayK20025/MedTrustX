'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AssistantPatient } from '../types/assistant.types';
import { Users } from 'lucide-react';

interface Props { patients: AssistantPatient[]; }

export function AssistantPatientList({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-white tracking-wide">Assigned Patients</h3>
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {patients.map(p => (
            <div key={p.id} className="p-3 rounded-lg border border-white/[0.04] bg-surface-dark flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[13px] font-bold text-white block">{p.name}</span>
                  <span className="text-[11px] text-gray-500 font-mono">{p.bed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
