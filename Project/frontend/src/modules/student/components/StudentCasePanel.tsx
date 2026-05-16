'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { StudentCase } from '../types/student.types';
import { ShieldAlert, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { cases: StudentCase[]; }

export function StudentCasePanel({ cases }: Props) {
  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Case Observations</h3>
        </div>
        <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" /> Anonymized PHI
        </span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px]">
        {cases.map(c => (
          <div key={c.id} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-indigo-300 font-bold">{c.id}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">{c.status}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
               <span className="text-xs bg-black/20 px-2 py-1 rounded text-gray-300">{c.patientAge} Y</span>
               <span className="text-xs bg-black/20 px-2 py-1 rounded text-gray-300">{c.patientGender}</span>
               <span className="text-xs bg-black/20 px-2 py-1 rounded text-gray-300 truncate max-w-[150px]">{c.department}</span>
            </div>
            <p className="text-sm text-white font-medium mb-3">{c.diagnosis}</p>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="h-7 px-3 text-[10px] border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
                View Academic File
              </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
