'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ProtocolInsight } from '../types/researcher.types';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { insights: ProtocolInsight[]; }

export function ResearchInsightsPanel({ insights }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-fuchsia-400" /> Data Insights
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {insights.map(ins => {
            const TrendIcon = ins.trend === 'up' ? TrendingUp : ins.trend === 'down' ? TrendingDown : Minus;
            const trendColor = ins.trend === 'up' ? 'text-emerald-400' : ins.trend === 'down' ? 'text-red-400' : 'text-gray-400';

            return (
              <div key={ins.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded',
                    ins.significance === 'high' ? 'bg-purple-500/15 text-purple-300' :
                    ins.significance === 'medium' ? 'bg-blue-500/15 text-blue-300' : 'bg-white/5 text-gray-400'
                  )}>
                    {ins.significance} Significance
                  </span>
                  <TrendIcon className={cn('w-4 h-4', trendColor)} />
                </div>

                <p className="text-[11px] text-gray-400 mb-1">{ins.metric}</p>
                <p className={cn('text-3xl font-black font-mono', trendColor)}>{ins.value}</p>
              </div>
            );
          })}
        </div>

        {/* Placeholder for future charts */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-white/[0.02] border border-white/10 border-dashed rounded-xl p-6 text-center">
            <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-[11px] text-gray-500 font-bold">Outcome Visualizations</p>
            <p className="text-[10px] text-gray-600 mt-1">Connect analytics engine to render Kaplan-Meier, forest plots, and p-value distributions.</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
