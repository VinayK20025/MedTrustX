'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PathologistCase, CaseResults } from '../types/pathologist.types';
import { Activity, Beaker, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeCase?: PathologistCase; results?: CaseResults; }

export function PathologistResultsTable({ activeCase, results }: Props) {
  if (!activeCase || !results) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center min-h-[400px]">
        <Beaker className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
        <p className="text-gray-500 font-bold">Select a case to view lab results.</p>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">LAB RESULTS DATAGRID</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
           <span className="text-white font-bold">{activeCase.patientName}</span> | {activeCase.patientId}
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-gray-500 bg-black/40">
              <th className="p-3 font-medium">PARAMETER</th>
              <th className="p-3 font-medium text-right">VALUE</th>
              <th className="p-3 font-medium">UNIT</th>
              <th className="p-3 font-medium">REFERENCE RANGE</th>
              <th className="p-3 font-medium">FLAG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[12px] text-gray-300 font-bold">
            {results.results.map(r => (
              <tr key={r.id} className={cn("hover:bg-white/5 transition-colors", 
                (r.flag === 'Critical High' || r.flag === 'Critical Low') ? 'bg-emergency/10 border-l-2 border-emergency text-emergency-light' : 
                (r.flag === 'High' || r.flag === 'Low') ? 'text-warning-light' : ''
              )}>
                <td className="p-3">{r.parameterName}</td>
                <td className="p-3 text-right text-[14px]">{r.value}</td>
                <td className="p-3 text-gray-500 font-normal">{r.unit}</td>
                <td className="p-3 text-gray-500 font-normal">{r.referenceRange}</td>
                <td className="p-3">
                  {r.flag !== 'Normal' && (
                    <span className={cn('px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider', 
                      (r.flag === 'Critical High' || r.flag === 'Critical Low') ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                    )}>{r.flag}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
