'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { QCChart } from '../types/biochemistry.types';
import { LineChart, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { charts: QCChart[]; }

export function BiochemQCPanel({ charts }: Props) {
  // Simulating a Levey-Jennings chart visually with a custom table/grid approach for now
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><LineChart className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">QC (Levey-Jennings)</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto">
        {charts.map((chart, idx) => {
          const hasFailures = chart.dataPoints.some(d => d.status === 'Fail');
          return (
            <div key={idx} className={cn("border rounded-xl bg-surface-dark overflow-hidden mb-4", hasFailures ? "border-emergency/40" : "border-white/10")}>
              <div className="p-3 bg-black/20 border-b border-white/5 flex justify-between items-center">
                <div className="text-[12px] font-bold text-white">{chart.parameterName}</div>
                <div className="text-[10px] text-gray-500 font-mono">Analyzer: {chart.analyzerId}</div>
              </div>
              <div className="p-4 grid grid-cols-4 gap-2">
                {chart.dataPoints.map((dp, i) => (
                  <div key={i} className={cn("p-2 border rounded text-center", 
                    dp.status === 'Fail' ? 'bg-emergency/10 border-emergency text-emergency-light' :
                    dp.status === 'Warning' ? 'bg-warning/10 border-warning text-warning-light' : 'bg-white/5 border-white/5 text-success-light'
                  )}>
                    <div className="text-[9px] text-gray-400 font-mono mb-1">{dp.date}</div>
                    <div className="text-[14px] font-bold">{dp.value}</div>
                    <div className="text-[9px] mt-1 flex justify-center gap-1">
                      {dp.status === 'Fail' && <AlertTriangle className="w-3 h-3" />}
                      {dp.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
