'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PatientFlowMetrics } from '../types/operations.types';
import { ArrowRight, AlertTriangle, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { flow: PatientFlowMetrics[]; }

const trendIcon = {
  up: <TrendingUp className="w-3.5 h-3.5 text-emergency-light" />,
  down: <TrendingDown className="w-3.5 h-3.5 text-success-light" />,
  flat: <Minus className="w-3.5 h-3.5 text-gray-500" />,
};

export function PatientFlowPanel({ flow }: Props) {
  return (
    <Card className="border-indigo-500/25 shadow-glass bg-[#03040a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-indigo-500/15"><Activity className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[14px] font-bold text-white tracking-wide">Patient Flow & Throughput</h3>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {flow.map((stage, i) => (
            <React.Fragment key={stage.stage}>
              <div className={cn("p-4 rounded-xl border relative transition-all", stage.bottleneck ? "bg-emergency/[0.03] border-emergency/30" : "bg-white/[0.02] border-white/5")}>
                {stage.bottleneck && <span className="absolute -top-2.5 -right-2.5 bg-emergency-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"><AlertTriangle className="w-2.5 h-2.5" /> BOTTLENECK</span>}
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[13px] font-bold text-white">{stage.stage}</h4>
                  <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-mono">Vol: {stage.currentVolume}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-500">Avg Wait Time:</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-bold text-[14px]", stage.bottleneck ? "text-emergency-light" : "text-white")}>{stage.avgWaitTimeMins} mins</span>
                    {trendIcon[stage.trend]}
                  </div>
                </div>
                {/* Visual Load Bar */}
                <div className="w-full bg-black/50 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className={cn("h-full transition-all", stage.bottleneck ? "bg-emergency-500" : "bg-indigo-500")} style={{ width: `${Math.min((stage.avgWaitTimeMins / 60) * 100, 100)}%` }} />
                </div>
              </div>
              {i < flow.length - 1 && (
                <div className="flex justify-center -my-1 opacity-50"><ArrowRight className="w-5 h-5 text-gray-500 rotate-90" /></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
