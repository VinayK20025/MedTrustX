'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { QualityOutcome } from '../types/med-director.types';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props { outcomes: QualityOutcome[]; }

const trendIcon = { improving: TrendingUp, stable: Minus, declining: TrendingDown };
const trendColor = { improving: 'text-success-light', stable: 'text-gray-400', declining: 'text-emergency-light' };

export function QualityPanel({ outcomes }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Quality Outcomes</h3>
          <p className="text-xs text-gray-400 mt-0.5">Benchmark-tracked clinical indicators</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3">
        {outcomes.map((o, i) => {
          const Icon = trendIcon[o.trend];
          const withinBenchmark = o.trend === 'declining' ? o.current > o.benchmark : o.current <= o.benchmark;
          return (
            <div key={i} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">{o.metric}</span>
                <div className={`flex items-center gap-1 ${trendColor[o.trend]}`}>
                  <Icon className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase">{o.trend}</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className={`text-xl font-black font-mono ${withinBenchmark ? 'text-success-light' : 'text-emergency-light'}`}>
                    {o.current}{o.unit ? ` ${o.unit}` : ''}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-2">prev: {o.previous}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${withinBenchmark ? 'bg-success/10 text-success-light' : 'bg-emergency/10 text-emergency-light'}`}>
                  Target: {o.benchmark}{o.unit ? ` ${o.unit}` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
