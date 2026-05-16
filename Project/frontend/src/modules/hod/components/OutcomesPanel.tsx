'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeptOutcome } from '../types/hod.types';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props { outcomes: DeptOutcome[]; }

const trendIcon = { improving: TrendingUp, stable: Minus, declining: TrendingDown };
const trendColor = { improving: 'text-success-light', stable: 'text-gray-400', declining: 'text-emergency-light' };

export function OutcomesPanel({ outcomes }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Clinical Outcomes</h3>
          <p className="text-xs text-gray-400 mt-0.5">Department performance vs benchmarks</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3">
        {outcomes.map((o, i) => {
          const Icon = trendIcon[o.trend];
          const metBenchmark = o.metric.toLowerCase().includes('success') || o.metric.toLowerCase().includes('rate') && !o.metric.toLowerCase().includes('complication') && !o.metric.toLowerCase().includes('readmission') && !o.metric.toLowerCase().includes('mortality')
            ? o.current >= o.benchmark
            : o.current <= o.benchmark;
          return (
            <div key={i} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white">{o.metric}</span>
                <div className={`flex items-center gap-1 ${trendColor[o.trend]}`}>
                  <Icon className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase">{o.trend}</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-lg font-black font-mono ${metBenchmark ? 'text-success-light' : 'text-warning-light'}`}>{o.current}{o.unit}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${metBenchmark ? 'bg-success/10 text-success-light' : 'bg-warning/10 text-warning-light'}`}>
                  Benchmark: {o.benchmark}{o.unit}
                </span>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
