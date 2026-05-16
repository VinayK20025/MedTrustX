'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICUConsultCase } from '../types/intensivist.types';
import { ClipboardList } from 'lucide-react';

interface Props { cases: ICUConsultCase[]; }

const priorityStyle: Record<string, string> = {
  critical: 'border-l-emergency bg-emergency/10',
  high_risk: 'border-l-warning bg-warning/5',
  stable: 'border-l-success bg-success/5',
};

export function CriticalCasesList({ cases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Assigned Cases</h3>
          <p className="text-xs text-gray-400 mt-0.5">{cases.length} pending review</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[500px]">
        {cases.map(c => (
          <div key={c.id} className={`p-3 border-l-4 rounded-r-lg border-y border-r border-white/[0.04] cursor-pointer hover:bg-white/[0.02] transition-colors ${priorityStyle[c.priority]}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{c.patientName} <span className="text-[10px] text-gray-500 font-normal">({c.age}{c.gender})</span></span>
              <span className="text-[10px] text-gray-400 bg-surface-dark px-1.5 py-0.5 rounded font-mono border border-white/[0.08]">{c.unit}</span>
            </div>
            <p className="text-[11px] text-gray-300 mb-1">{c.diagnosis}</p>
            <div className="text-[10px] text-warning-light bg-warning/10 p-1.5 rounded flex gap-2 items-center">
              <span className="font-bold">ISSUE:</span> <span className="truncate">{c.keyIssue}</span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
