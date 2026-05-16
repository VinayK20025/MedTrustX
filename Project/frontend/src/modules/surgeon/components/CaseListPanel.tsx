'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SurgicalCase } from '../types/surgeon.types';
import { ClipboardList, ArrowRight } from 'lucide-react';

interface Props { cases: SurgicalCase[]; }

const statusStyle: Record<string, string> = {
  pre_op: 'bg-indigo-500/20 text-indigo-300',
  scheduled: 'bg-blue-500/20 text-blue-300',
  intra_op: 'bg-emergency/20 text-emergency-light animate-pulse',
  post_op: 'bg-warning/20 text-warning-light',
  discharged: 'bg-success/20 text-success-light',
};
const priorityStyle: Record<string, string> = {
  elective: 'text-gray-400',
  urgent: 'text-warning-light font-bold',
  emergency: 'text-emergency-light font-black animate-pulse',
};

export function CaseListPanel({ cases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Active Cases</h3>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 px-2 border-white/[0.1]">View All <ArrowRight className="w-3 h-3"/></Button>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Procedure</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium">Timing / Loc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {cases.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">{c.patientName} <span className="text-[10px] text-gray-500 font-normal">({c.age}{c.gender})</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{c.diagnosis}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-200">{c.procedure}</p>
                  <p className={`text-[9px] uppercase tracking-widest mt-0.5 ${priorityStyle[c.priority]}`}>{c.priority}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${statusStyle[c.status]}`}>
                    {c.status.replace('_', '-')}
                  </span>
                </td>
                <td className="px-4 py-3 text-[10px] text-gray-400 font-mono">
                  {c.scheduledDate ? c.scheduledDate : `${c.ward} ${c.bed}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
