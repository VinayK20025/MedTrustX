'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BiochemSample, BiochemTestResult } from '../types/biochemistry.types';
import { useValidateResult } from '../hooks/useBiochemAnalytics';
import { Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeSample?: BiochemSample; result?: BiochemTestResult; }

export function BiochemResultsTable({ activeSample, result }: Props) {
  const { mutate: validate, isPending } = useValidateResult();

  if (!activeSample || !result) return null;

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">ANALYZER RESULTS (RAW)</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
           <span className="text-white font-bold">{activeSample.patientName}</span> | {result.analyzerId}
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse flex-1">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-gray-500 bg-black/40">
              <th className="p-3 font-medium">PARAMETER</th>
              <th className="p-3 font-medium text-right">VALUE</th>
              <th className="p-3 font-medium">UNIT</th>
              <th className="p-3 font-medium">REF. RANGE</th>
              <th className="p-3 font-medium">PREVIOUS</th>
              <th className="p-3 font-medium">FLAG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[12px] text-gray-300 font-bold">
            {result.parameters.map(r => (
              <tr key={r.id} className={cn("hover:bg-white/5 transition-colors", 
                (r.flag === 'Critical High' || r.flag === 'Critical Low') ? 'bg-emergency/10 border-l-2 border-emergency text-emergency-light' : 
                (r.flag === 'High' || r.flag === 'Low') ? 'text-warning-light' : ''
              )}>
                <td className="p-3">{r.parameterName}</td>
                <td className="p-3 text-right text-[14px]">{r.value}</td>
                <td className="p-3 text-gray-500 font-normal">{r.unit}</td>
                <td className="p-3 text-gray-500 font-normal">{r.referenceRange}</td>
                <td className="p-3 text-gray-500 font-normal">{r.previousValue || '-'}</td>
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

        {activeSample.status === 'Ready for Validation' && (
          <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
            <Button size="sm" onClick={() => validate(activeSample.id)} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold" leftIcon={<CheckCircle2 className="w-4 h-4"/>}>
              Validate & Publish Results
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
