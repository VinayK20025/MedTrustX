'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { IcuOversightMetrics } from '../types/cmo.types';
import { Stethoscope } from 'lucide-react';

interface IcuOversightPanelProps {
  data: IcuOversightMetrics;
}

export function IcuOversightPanel({ data }: IcuOversightPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">ICU Oversight</h3>
          <p className="text-xs text-gray-400 mt-0.5">Critical care & clinical risk</p>
        </div>
        <Stethoscope className="w-5 h-5 text-indigo-400 opacity-50" />
      </CardHeader>
      
      <CardBody className="p-5 flex-1 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Sepsis Cases</p>
          <span className={`text-3xl font-black font-mono ${data.sepsisCases > 2 ? 'text-emergency-light' : 'text-white'}`}>
            {data.sepsisCases}
          </span>
        </div>

        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Mortality Risk</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-warning-light font-mono">{data.mortalityRiskAvg}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Avg</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] flex flex-col justify-center col-span-2">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Ventilator Protocol</p>
              <p className="text-xs text-gray-400">Utilization & compliance tracking</p>
            </div>
            <span className="text-2xl font-black text-white font-mono">{data.ventilatorUtilization}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${data.ventilatorUtilization > 80 ? 'bg-emergency' : 'bg-indigo-500'}`}
              style={{ width: `${data.ventilatorUtilization}%` }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
